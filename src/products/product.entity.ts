import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";

import { CURRENT_TIMESTAMP } from "../utils/constants";
import { Review } from "../reviews/review.entity";
import { User } from "../users/user.entity";

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "float" })
  price!: number;

  @Column({ nullable: true })
  primaryImage!: string;

  @Column({ type: "json", nullable: true })
  secondaryImages!: string;

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

  @ManyToOne(() => User, (user) => user.products, { eager: true })
  user!: User;

  @OneToMany(() => Review, (review) => review.product, { eager: true })
  reviews!: Review[];
}
