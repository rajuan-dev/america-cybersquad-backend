class PrismaQueryBuilder {
  public query: Record<string, any>;
  public where: any = {};
  public orderBy: any = {};
  public skip: number = 0;
  public take: number = 10;
  public select: any = undefined;

  constructor(query: Record<string, any>) {
    this.query = query;
  }

  // 🔍 SEARCH
  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm;

    if (searchTerm) {
      this.where.OR = searchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      }));
    }

    return this;
  }

  // 🎯 FILTER (DYNAMIC)
  filter() {
    const queryObject = { ...this.query };

    const excludeField = [
      "searchTerm",
      "sort",
      "limit",
      "page",
      "fields",
      "joinDateFrom",
      "joinDateTo",
      "branchName",
    ];

    excludeField.forEach((el) => delete queryObject[el]);

    Object.entries(queryObject).forEach(([key, value]) => {
      if (!value) return;

      // exact match fields
      if (["id", "userId", "role"].includes(key)) {
        this.where[key] = value;
      } else {
        // partial match
        this.where[key] = {
          contains: String(value),
          mode: "insensitive",
        };
      }
    });

    return this;
  }

  // 🔀 SORT
  sort() {
    const sort = this.query?.sort;

    if (sort) {
      const fields = sort.split(",");

      this.orderBy = fields.map((field: string) => {
        if (field.startsWith("-")) {
          return { [field.substring(1)]: "desc" };
        }
        return { [field]: "asc" };
      });
    } else {
      this.orderBy = { createdAt: "desc" };
    }

    return this;
  }

  // 📄 PAGINATION
  paginate() {
    const limit = Math.max(Number(this.query.limit) || 10, 1);
    const page = Math.max(Number(this.query.page) || 1, 1);

    this.take = limit;
    this.skip = (page - 1) * limit;

    return this;
  }

  // 🎯 SELECT FIELDS
  fields() {
    if (this.query?.fields) {
      const fields = this.query.fields.split(",");

      this.select = fields.reduce((acc: any, field: string) => {
        acc[field] = true;
        return acc;
      }, {});
    }

    return this;
  }

  // 🏗 BUILD
  build() {
    return {
      where: this.where,
      orderBy: this.orderBy,
      skip: this.skip,
      take: this.take,
      select: this.select,
    };
  }
}

export default PrismaQueryBuilder;