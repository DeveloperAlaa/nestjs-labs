import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CURRENT_TIMESTAMP } from "../utils/constants";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";

@Entity({ name: "reviews" })
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  rate!: number;

  @Column()
  comment!: string;

  @CreateDateColumn({name: "created_at", type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.reviews)
  user!: User;

  @ManyToOne(() => Product, (product) => product.reviews)
  product!: Product;
}
