import { getOptionValue as getOptionValueModel } from "@/cmf/models/option";
export async function getOptionValue(key: string) {
    const optionObj = await getOptionValueModel(key);
    const optionValue = optionObj.optionValue ? JSON.parse(optionObj.optionValue) : {};
    return optionValue;
}