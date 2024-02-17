import {  Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SingInDto } from './dto/signin.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserActiveInterface } from 'src/common/interfaces/user.active.interface';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async signIn({ email, password }: SingInDto ): Promise<{ access_token: string }> {
        const user = await this.usersService.findOneByEmailWithPassword(email);
        const isValidPassword = await bcryptjs.compare(password, user.password)
        if(!isValidPassword) throw new UnauthorizedException('Password is wrong')
        const payload = { email: user.email, role: user.role }
        return {
            access_token: await this.jwtService.signAsync(payload)
        }   
    }

    async register({ username, email, password }: RegisterDto) {
        await this.usersService.userEmailExist(email)
        await this.usersService.create({
            username,
            email,
            password: await bcryptjs.hash(password, 10)
        })
        return {
            username,
            email
        }
    }

    getProfile(user: UserActiveInterface) {
      return this.usersService.findOneWithEmail(user.email);
    }

}
