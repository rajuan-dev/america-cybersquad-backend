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

  filter() {
    const queryObject = { ...this.query };

    const excludeField = ["searchTerm", "sort", "limit", "page", "fields"];
    excludeField.forEach((el) => delete queryObject[el]);

    if (this.query?.maxPrice) {
      this.where.price = {
        gte: Number(this.query.minPrice),
        lte: Number(this.query.maxPrice),
      };
    }

    if (this.query?.releaseDate) {
      this.where.releaseDate = new Date(this.query.releaseDate);
    }

    return this;
  }

 
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

 
  paginate() {
    const limit = Math.max(Number(this.query.limit) || 10, 1);
    const page = Math.max(Number(this.query.page) || 1, 1);

    this.take = limit;
    this.skip = (page - 1) * limit;

    return this;
  }

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