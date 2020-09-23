export type EntityToSave<T> = T & { action: 'delete' | 'post' | 'put' };
