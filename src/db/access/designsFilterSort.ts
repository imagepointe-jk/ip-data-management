import {
  DesignQuery,
  DesignWithIncludes,
  SortingType,
} from "@/types/schema/designs";

export function filterDesigns(
  designs: DesignWithIncludes[],
  query: DesignQuery,
  designForSimilarCheck?: DesignWithIncludes | undefined
) {
  return designs.filter((design) => {
    return (
      ageCondition({ design, query }) &&
      statusCondition({ design, query }) &&
      featuredCondition({ design, query }) &&
      designTypeCondition({ design, query }) &&
      subcategoryCondition({ design, query }) &&
      keywordCondition({ design, query }) &&
      similarCondition(design, designForSimilarCheck) &&
      fileExtensionCondition({ design, query })
    );
  });
}

type ConditionParams = {
  design: DesignWithIncludes;
  query: DesignQuery;
};
function ageCondition(params: ConditionParams) {
  const designTimestamp = params.design.date.getTime();
  const { before, after } = params.query;

  if (before !== undefined) return designTimestamp < before;
  if (after !== undefined) return designTimestamp > after;

  return true;
}

function statusCondition(params: ConditionParams) {
  if (params.query.status === undefined)
    return params.design.status === "Published"; //default to hiding drafts if no status is specified
  if (params.query.status === "Any") return true;
  return params.design.status === params.query.status;
}

function featuredCondition(params: ConditionParams) {
  if (!params.query.featuredOnly) return true;
  return params.design.featured === true;
}

function designTypeCondition(params: ConditionParams) {
  if (params.query.designType === undefined) return true;
  return params.design.designType.name === params.query.designType;
}

function subcategoryCondition(params: ConditionParams) {
  if (params.query.subcategory === undefined) return true;
  return !!params.design.designSubcategories.find(
    (sub) => sub.name === params.query.subcategory
  );
}

function keywordCondition(params: ConditionParams) {
  const {
    query: { keyword },
    design,
  } = params;
  if (keyword === undefined) return true;

  const keywordLower = keyword.toLocaleLowerCase();
  const inName = design.name?.toLocaleLowerCase().includes(keywordLower);
  const inDescription = design.description
    ?.toLocaleLowerCase()
    .includes(keywordLower);
  const inDesignNumber = design.designNumber
    .toLocaleLowerCase()
    .includes(keywordLower);
  const inSubcategories = design.designSubcategories
    .map((sub) => sub.name.toLocaleLowerCase())
    .join(",")
    .includes(keywordLower);
  const inTags = design.designTags
    .map((tag) => tag.name.toLocaleLowerCase())
    .join(",")
    .includes(keywordLower);

  return inName || inDescription || inDesignNumber || inSubcategories || inTags;
}

function fileExtensionCondition(params: ConditionParams) {
  const {
    query: { fileExtension },
    design,
  } = params;
  if (fileExtension === undefined) return true;

  const split = fileExtension.split("-");
  const operator = split[0] === "any" ? "any" : "all";
  const extension = split[1] === "jpg" ? "jpg" : "png";

  const inMainDesign = design.imageUrl
    .toLocaleLowerCase()
    .includes(`.${extension}`);
  const variationsWithExtension = design.variations.filter((variation) =>
    variation.imageUrl.toLocaleLowerCase().includes(`.${extension}`)
  );

  if (operator === "all")
    return (
      inMainDesign &&
      variationsWithExtension.length === design.variations.length
    );
  else return inMainDesign || variationsWithExtension.length > 0;
}

function similarCondition(
  design: DesignWithIncludes,
  referenceDesign?: DesignWithIncludes
) {
  if (!referenceDesign) return true;

  const subcategoriesInCommon = design.designSubcategories.reduce(
    (accum, sub) => {
      const alsoInReference = !!referenceDesign.designSubcategories.find(
        (refSub) => refSub.name === sub.name
      );
      if (alsoInReference) return accum + 1;
      return accum;
    },
    0
  );
  const tagsInCommon = design.designTags.reduce((accum, tag) => {
    const alsoInReference = !!referenceDesign.designTags.find(
      (refTag) => refTag.name === tag.name
    );
    if (alsoInReference) return accum + 1;
    return accum;
  }, 0);

  const similarMinimum = 3;
  return subcategoriesInCommon + tagsInCommon >= similarMinimum;
}

export function sortDesigns(designs: DesignWithIncludes[], query: DesignQuery) {
  designs.sort((designA, designB) => {
    if (!query.sortBy) return defaultSortFn(designA, designB);

    return sortingFunctions[query.sortBy.type]!({
      designA,
      designB,
      direction: query.sortBy.direction,
    });
  });
}

function defaultSortFn(
  designA: DesignWithIncludes,
  designB: DesignWithIncludes
) {
  if (designA.featured !== designB.featured) {
    return designA.featured ? -1 : 1;
  } else {
    if (designA.priority === designB.priority) {
      return designA.designNumber < designB.designNumber ? 1 : -1;
    } else {
      return designA.priority < designB.priority ? 1 : -1;
    }
  }
}

type SortingParams = {
  designA: DesignWithIncludes;
  designB: DesignWithIncludes;
  direction: "Ascending" | "Descending";
};
type SortingFunctions = {
  [key in SortingType]: (params: SortingParams) => number;
};
const sortingFunctions: SortingFunctions = {
  "Design Number": (params) =>
    compareDesignValues(params, (design) => design.designNumber),
  Priority: (params) =>
    compareDesignValues(params, (design) => design.priority),
  Date: (params) =>
    compareDesignValues(params, (design) => design.date.getTime()),
};

function compareDesignValues(
  params: SortingParams,
  getValue: (design: DesignWithIncludes) => number | string
) {
  const { designA, designB, direction } = params;
  if (direction === "Descending") {
    return getValue(designA) < getValue(designB) ? 1 : -1;
  } else {
    return getValue(designA) < getValue(designB) ? -1 : 1;
  }
}
