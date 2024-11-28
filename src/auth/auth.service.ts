/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import * as bcryptjs from 'bcryptjs';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginDto, RegisterUserDto } from './dto';
import { JwtPayload, LoginResponse } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;

      const newUser = this.usersRepository.create({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });

      return this.usersRepository.save(newUser);
    } catch (error) {
      if (error) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
      throw new InternalServerErrorException('Something terrible happen!!!');
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
    const user = await this.create(registerUserDto);

    return {
      user: user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({where: { email } });
    if (!user) throw new UnauthorizedException('Not valid credentials - email');

    if (!bcryptjs.compareSync(password, user.password))
      throw new UnauthorizedException('Not valid credentials - password');

    return {
      user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
