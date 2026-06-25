import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmail: jest.fn(),
      findOneById: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new client user successfully', async () => {
      const registerDto = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      };
      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jwtService.sign.mockReturnValue('token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: 'token',
        tokenType: 'Bearer',
        user: {
          id: 1,
          name: 'Test',
          email: 'test@example.com',
          role: UserRole.CLIENT,
        },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user email already exists', async () => {
      const registerDto = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      };
      usersService.findOneByEmail.mockResolvedValue({
        id: 1,
        name: 'Existing',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login a user successfully with correct credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash('password123', 10);

      usersService.findOneByEmail.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        password: hashedPassword,
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jwtService.sign.mockReturnValue('token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'token',
        tokenType: 'Bearer',
        user: {
          id: 1,
          name: 'Test',
          email: 'test@example.com',
          role: UserRole.CLIENT,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash('differentPassword', 10);

      usersService.findOneByEmail.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        password: hashedPassword,
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
