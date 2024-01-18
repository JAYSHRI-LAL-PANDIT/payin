import { PartialType } from '@nestjs/mapped-types';
import { CreatePayinDto } from './create-payin.dto';

export class UpdatePayinDto extends PartialType(CreatePayinDto) {}
