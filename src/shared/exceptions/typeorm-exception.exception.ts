/**
 * Class representing a TypeOrm Exception format
 * @author Awesomity Lab
 * @version 1.0
 */
export class TypeOrmException extends Error {
  code: string;
  name: string;
  message: string;
  detail: string;
}
