import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Exclude } from "class-transformer";

import { TUserRole } from "../common/enums";
import { CURRENT_TIMESTAMP } from "../common/constants";
import { Product } from "../products/product.entity";
import { Review } from "../reviews/review.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150, nullable: true })
  username!: string;

  @Column({ type: "varchar", length: 250, unique: true })
  email!: string;

  @Exclude()
  @Column({})
  password!: string;

  @Column({ nullable: true, default: null })
  profileImage!: string;

  @Column({ name: "is_account_verified", type: "boolean", default: false })
  isAccountVerified!: boolean;

  @Column({nullable: true, default: null})
  verificationToken!: string 

  @Column({nullable: true, default: null})
  resetPasswordToken!: string 
 
  @Column({
    name: "user_role",
    type: "enum",
    enum: TUserRole,
    default: TUserRole.User,
  })
  userRole!: TUserRole;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => CURRENT_TIMESTAMP,
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt!: Date;

  @OneToMany(() => Product, (product) => product.user)
  products!: Product[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];
}
