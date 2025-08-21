export const modifyGeneralFilterPrisma = (filterObj: any) => {
  let whereObj: any = {};
  const paramKeys = Object.keys(filterObj);

  for (let key of paramKeys) {
    const columnKey = key.split('___')?.[1];
    const value = filterObj[key];

    if (!columnKey) continue;

    switch (true) {
      case key.includes('greaterthanequalto___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), gte: Number(value) };
        break;
      case key.includes('lessthanequalto___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), lte: Number(value) };
        break;
      case key.includes('greaterthan___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), gt: Number(value) };
        break;
      case key.includes('lessthan___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), lt: Number(value) };
        break;
      case key.includes('equalto___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), equals: value };
        break;
      case key.includes('notequalto___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), not: value };
        break;
      case key.includes('notnull___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), not: null };
        break;
      case key.includes('null___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), equals: null };
        break;
      case key.includes('in___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), in: value ? String(value).split(',') : [] };
        break;
      case key.includes('notin___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), notIn: value ? String(value).split(',') : [] };
        break;
      case key.includes('like___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), contains: value, mode: 'insensitive' };
        break;
      case key.includes('regex___'):
        // Prisma doesn’t support regex natively for all DBs, fallback to contains or raw queries
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), contains: value };
        break;
      default:
        break;
    }
  }

  return whereObj;
};
