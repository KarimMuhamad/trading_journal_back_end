import { Prisma } from "../generated/client";

export const softDeleteExtension = Prisma.defineExtension({
    name: 'softDelete',

    query: {
        user: {
            async findMany({ args, query }) {
                if ((args.where as Record<string, any>)?.includeDeleted) {
                    delete (args.where as Record<string, any>)?.includeDeleted;
                    return query(args);
                }

                args.where = { ...args.where, deleted_at: null };
                return query(args);
            },

            async findFirst({ args, query }) {
                if ((args.where as Record<string, any>)?.includeDeleted) {
                    delete (args.where as Record<string, any>)?.includeDeleted;
                    return query(args);
                }

                args.where = { ...args.where, deleted_at: null };
                return query(args);
            },

            async findUnique({ args, query }) {
                if ((args.where as Record<string, any>)?.includeDeleted) {
                    delete (args.where as Record<string, any>)?.includeDeleted;
                    return query(args);
                }

                args.where = { ...args.where, deleted_at: null };
                return query(args);
            }
        },

        accounts: {
            async findMany({ args, query }) {
                if ((args.where as Record<string, any>)?.includeArchived) {
                    delete (args.where as Record<string, any>)?.includeArchived;
                    return query(args);
                }

                args.where = { ...args.where, is_archived: false };
                return query(args);
            },

            async findFirst({ args, query }) {
                if ((args.where as Record<string, any>)?.includeArchived) {
                    delete (args.where as Record<string, any>)?.includeArchived;
                    return query(args);
                }

                args.where = { ...args.where, is_archived: false };
                return query(args);
            },

            async findUnique({ args, query }) {
                if ((args.where as Record<string, any>)?.includeArchived) {
                    delete (args.where as Record<string, any>)?.includeArchived;
                    return query(args);
                }

                args.where = { ...args.where, is_archived: false };
                return query(args);
            }
        }
    }
});