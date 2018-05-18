import { readdirSync } from 'fs';

export class MigrationRegistry {
    public getRegistry(): string[] {
        return readdirSync(`${__dirname}/migrations/`);
    }
}

export default MigrationRegistry;
