export const modifyGeneralFilterPrisma = (filterObj: any) => {
  let whereObj: any = {};
  const paramKeys = Object.keys(filterObj);

  for (let key of paramKeys) {
    const columnKey = key.split('___')?.[1];
    const value = filterObj[key];

    if (!columnKey) continue;

    switch (true) {
      case key.includes('gte___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), gte: Number(value) };
        break;
      case key.includes('lte___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), lte: Number(value) };
        break;
      case key.includes('gt___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), gt: Number(value) };
        break;
      case key.includes('lt___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), lt: Number(value) };
        break;
      case key.includes('eq___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), equals: value };
        break;
      case key.includes('neq___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), not: value };
        break;
      case key.includes('notnull___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), not: null };
        break; 
      case key.includes('isnull___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), equals: null };
        break;
      case key.includes('in___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), in: value ? String(value).split(',') : [] };
        break;
      case key.includes('not_in___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), notIn: value ? String(value).split(',') : [] };
        break;
      case key.includes('contains___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), contains: value, mode: 'insensitive' };
        break;
      case key.includes('not_contains___'):
        // Prisma doesn’t support regex natively for all DBs, fallback to contains or raw queries
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), contains: value };
        break;
      default:
        break;
    }
  }

  return whereObj;
};
