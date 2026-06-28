class PrismaRelationQueryBuilder {
  public query: Record<string, any>;
  public where: any = {};
  public orderBy: any = {};
  public skip = 0;
  public take = 10;
  public select: any = undefined;

  constructor(query: Record<string, any>) {
    this.query = query;
  }

  // ==========================
  // SEARCH
  // ==========================
  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm;

    if (!searchTerm) return this;

    this.where.OR = searchableFields.map((field) => {
      if (field.includes(".")) {
        const [relation, relationField] = field.split(".");

        // One-to-many relation
        if (relation === "classDistributions") {
          return {
            classDistributions: {
              some: {
                [relationField]: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          };
        }

        // One-to-one relation
        return {
          [relation]: {
            [relationField]: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        };
      }

      return {
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      };
    });

    return this;
  }

  // ==========================
  // FILTER
  // ==========================
  filter() {
    const queryObject = { ...this.query };

    [
      "searchTerm",
      "sort",
      "limit",
      "page",
      "fields",
    ].forEach((field) => delete queryObject[field]);

    Object.entries(queryObject).forEach(([key, value]) => {
      if (!value) return;

      if (key.includes(".")) {
        const [relation, relationField] = key.split(".");

        if (relation === "classDistributions") {
          this.where.classDistributions = {
            some: {
              [relationField]:
                typeof value === "string"
                  ? {
                      contains: value,
                      mode: "insensitive",
                    }
                  : value,
            },
          };
        } else {
          this.where[relation] = {
            [relationField]:
              typeof value === "string"
                ? {
                    contains: value,
                    mode: "insensitive",
                  }
                : value,
          };
        }

        return;
      }

      if (
        [
          "id",
          "teacherId",
          "userId",
          "role",
          "status",
          "day",
          "classLevel",
        ].includes(key)
      ) {
        this.where[key] = value;
      } else {
        this.where[key] = {
          contains: String(value),
          mode: "insensitive",
        };
      }
    });

    return this;
  }

  // ==========================
  // SORT
  // ==========================
  sort() {
    const sort = this.query?.sort;

    if (!sort) {
      this.orderBy = {
        createdAt: "desc",
      };
      return this;
    }

    this.orderBy = sort.split(",").map((field: string) => {
      if (field.startsWith("-")) {
        return {
          [field.substring(1)]: "desc",
        };
      }

      return {
        [field]: "asc",
      };
    });

    return this;
  }

  // ==========================
  // PAGINATION
  // ==========================
  paginate() {
    const page = Math.max(Number(this.query.page) || 1, 1);
    const limit = Math.max(Number(this.query.limit) || 10, 1);

    this.skip = (page - 1) * limit;
    this.take = limit;

    return this;
  }

  // ==========================
  // SELECT
  // ==========================
  fields() {
    if (!this.query.fields) return this;

    const fields = this.query.fields.split(",");

    this.select = fields.reduce((acc: any, field: string) => {
      acc[field] = true;
      return acc;
    }, {});

    return this;
  }

  // ==========================
  // BUILD
  // ==========================
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

export default PrismaRelationQueryBuilder;