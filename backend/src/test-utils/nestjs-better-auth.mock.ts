import { createParamDecorator } from "@nestjs/common";

export class AuthGuard {
  canActivate() {
    return true;
  }
}

function AuthModuleMock() {}

export const AuthModule = {
  forRoot(options: unknown) {
    return {
      module: AuthModuleMock,
      providers: [{ provide: "BETTER_AUTH_OPTIONS", useValue: options }],
    };
  },
};

export const Session = createParamDecorator(
  (_data, context) => context.switchToHttp().getRequest().session,
);
