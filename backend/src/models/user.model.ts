import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '../config/constants';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  verificationToken?: string;
  verificationExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateResetToken(): string;
  generateVerificationToken(): string;
  isLocked(): boolean;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        'Please provide a valid phone number'
      ]
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer'
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String,
    verificationExpire: Date
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.verificationToken;
        delete ret.verificationExpire;
        return ret;
      }
    }
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function(): string {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    firstName: this.firstName,
    lastName: this.lastName
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate reset password token
userSchema.methods.generateResetToken = function(): string {
  const resetToken = jwt.sign(
    { id: this._id, purpose: 'password-reset' },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  this.resetPasswordToken = resetToken;
  this.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return resetToken;
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function(): string {
  const verificationToken = jwt.sign(
    { id: this._id, purpose: 'email-verification' },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );

  this.verificationToken = verificationToken;
  this.verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return verificationToken;
};

// Check if account is locked
userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Handle failed login attempts
userSchema.methods.incLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;