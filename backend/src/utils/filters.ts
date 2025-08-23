export const modifyGeneralFilterPrisma = (filterObj: any) => {
  let whereObj: any = {};
  const paramKeys = Object.keys(filterObj);

  for (let key of paramKeys) {
    const columnKey = key.split('___')?.[1];
    const value = filterObj[key];

    if (!columnKey) continue;

    // helper to cast based on column
    const castDateValue = (col: string, v: any, op: string) => {
      if (col === "deadline") {
        const date = new Date(v);
        if (op === "lte") {
          // push to end of day
          date.setUTCHours(23, 59, 59, 999);
        } else {
          // start of day
          date.setUTCHours(0, 0, 0, 0);
        }
        return date;
      }
      return Number(v);
    };

    switch (true) {
      case key.includes('gte___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), gte: castDateValue(columnKey, value, "gte") };
        break;
      case key.includes('lte___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), lte: castDateValue(columnKey, value, "lte") };
        break;
      case key.includes('gt___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), gt: castDateValue(columnKey, value, "gt") };
        break;
      case key.includes('lt___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), lt: castDateValue(columnKey, value, "lt") };
        break;
      case key.includes('eq___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), equals: columnKey === "deadline" ? new Date(value) : value };
        break;
      case key.includes('neq___'):
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), not: columnKey === "deadline" ? new Date(value) : value };
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
        whereObj[columnKey] = { ...(whereObj[columnKey] ?? {}), contains: value };
        break;
      default:
        break;
    }
  }

  return whereObj;
};
