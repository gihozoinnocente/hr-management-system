import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  async hash(plainText: string): Promise<string> {
    const hash = await bcrypt.hash(plainText, 10);
    return hash;
  }

  async compare(plainText: string, hash: string) {
    const result = await bcrypt.compare(plainText, hash);
    return result;
  }
}
