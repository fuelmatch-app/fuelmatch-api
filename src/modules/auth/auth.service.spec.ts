import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock do PrismaService
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock-access-token'),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultVal?: string) => {
    const config: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
    };
    return config[key] ?? defaultVal;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'nutri@test.com',
      password: 'Senha@123',
      role: Role.NUTRITIONIST,
    };

    it('deve criar um novo usuário com sucesso', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: registerDto.email,
        role: registerDto.role,
        createdAt: new Date(),
      });
      mockPrisma.refreshToken.create.mockResolvedValue({
        token: 'mock-refresh-token',
      });

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
    });

    it('deve lançar ConflictException se email já existir', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve hashear a senha antes de salvar', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: registerDto.email,
        role: registerDto.role,
        createdAt: new Date(),
      });
      mockPrisma.refreshToken.create.mockResolvedValue({ token: 'token' });

      await service.register(registerDto);

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      const savedPassword = createCall.data.password;

      // Senha salva deve ser diferente da original (hasheada)
      expect(savedPassword).not.toBe(registerDto.password);
      // E deve ser verificável com bcrypt
      const isValid = await bcrypt.compare(registerDto.password, savedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'nutri@test.com', password: 'Senha@123' };
    const hashedPassword = bcrypt.hashSync('Senha@123', 10);

    it('deve retornar tokens com credenciais válidas', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: loginDto.email,
        password: hashedPassword,
        role: Role.NUTRITIONIST,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({ token: 'token' });

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('deve lançar UnauthorizedException com email inválido', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException com senha inválida', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: loginDto.email,
        password: bcrypt.hashSync('outra-senha', 10),
        role: Role.NUTRITIONIST,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('deve retornar novos tokens com refresh token válido', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        token: 'valid-refresh-token',
        expiresAt: futureDate,
        user: { id: 'uuid-1', email: 'nutri@test.com', role: Role.NUTRITIONIST },
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({ token: 'new-token' });

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('mock-access-token');
      // Token antigo deve ser deletado (rotação)
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'token-id' },
      });
    });

    it('deve lançar UnauthorizedException com token expirado', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id',
        token: 'expired-token',
        expiresAt: pastDate,
        user: { id: 'uuid-1', email: 'test@test.com', role: Role.ATHLETE },
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException com token inexistente', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
