import { paramConversion } from 'utils/paramConversion';

export const isNumType = (type: string) =>
  paramConversion.num.some((el) => type.indexOf(el) >= 0);

export const transformParams = (
  paramFields: any[],
  inputParams: any[],
  opts = { emptyAsNull: true }
) => {
  // if `opts.emptyAsNull` is true, empty param value will be added to res as `null`.
  //   Otherwise, it will not be added
  const paramVal = inputParams.map((inputParam) => {
    // To cater the js quirk that `null` is a type of `object`.
    if (
      typeof inputParam === 'object' &&
      inputParam !== null &&
      typeof inputParam.value === 'string'
    ) {
      return inputParam.value.trim();
    }
    if (typeof inputParam === 'string') {
      return inputParam.trim();
    }
    return inputParam;
  });
  const params = paramFields.map((field, ind) => ({
    ...field,
    value: paramVal[ind] || null
  }));

  return params.reduce((memo, { type = 'string', value }) => {
    if (value == null || value === '')
      return opts.emptyAsNull ? [...memo, null] : memo;

    let converted = value;

    // Deal with a vector
    if (type.indexOf('Vec<') >= 0) {
      converted = converted.split(',').map((e: string) => e.trim());
      converted = converted.map((single: string) => {
        if (isNumType(type)) {
          if (single.indexOf('.') >= 0) {
            return parseFloat(single);
          }
          return parseInt(single, 10);
        }
        return single;
      });
      return [...memo, converted];
    }

    // Deal with a single value
    if (isNumType(type)) {
      converted =
        converted.indexOf('.') >= 0
          ? parseFloat(converted)
          : parseInt(converted, 10);
    }
    return [...memo, converted];
  }, []);
};
