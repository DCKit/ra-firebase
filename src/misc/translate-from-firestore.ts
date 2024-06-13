import { getDownloadURL, ref } from 'firebase/storage';
import { has, set } from 'lodash';
import { IFirebaseWrapper } from 'providers/database';
import { FireStoreDocumentRef } from './firebase-models';
import { REF_FULLPATH } from './internal.models';
import { logError } from './logger';

export interface RefDocFound {
  fieldPath: string;
  refDocPath: string;
}

export interface FromFirestoreResult {
  parsedDoc: any;
  refdocs: RefDocFound[];
}

export function translateDocFromFirestore(obj: any) {
  const isObject = !!obj && typeof obj === 'object';
  const result: FromFirestoreResult = {
    parsedDoc: {},
    refdocs: [],
  };
  if (!isObject) {
    return result;
  }
  Object.keys(obj).map((key) => {
    const value = obj[key];
    obj[key] = recursivelyCheckObjectValue(value, key, result);
  });
  result.parsedDoc = obj;
  return result;
}

export function recursivelyCheckObjectValue(
  input: any,
  fieldPath: string,
  result: FromFirestoreResult
): any {
  const isPrimitive = typeof input !== 'object';
  if (!input || isPrimitive) {
    return input;
  }
  const isTimestamp = !!input.toDate && typeof input.toDate === 'function';
  if (isTimestamp) {
    return input.toDate();
  }
  const isArray = Array.isArray(input);
  if (isArray) {
    return (input as any[]).map((value, index) =>
      recursivelyCheckObjectValue(value, `${fieldPath}.${index}`, result)
    );
  }
  const isDocumentReference = isInputADocReference(input);
  if (isDocumentReference) {
    const documentReference = input as FireStoreDocumentRef;
    result.refdocs.push({
      fieldPath: fieldPath,
      refDocPath: documentReference.path,
    });
    return documentReference.id;
  }
  const isObject = typeof input === 'object';
  if (isObject) {
    Object.keys(input).map((key) => {
      const value = input[key];
      input[key] = recursivelyCheckObjectValue(value, key, result);
    });
    return input;
  }
  return input;
}

function isInputADocReference(input: any): boolean {
  const isDocumentReference =
    typeof input.id === 'string' &&
    typeof input.firestore === 'object' &&
    typeof input.parent === 'object' &&
    typeof input.path === 'string';
  return isDocumentReference;
}

export function applyRefDocs(doc: any, refDocs: RefDocFound[]) {
  refDocs.map((d) => {
    set(doc, REF_FULLPATH + d.fieldPath, d.refDocPath);
  });
  return doc;
}

export const recursivelyMapStorageUrls = async (
  fireWrapper: IFirebaseWrapper,
  fieldValue: any
): Promise<any> => {
  const isPrimitive = !fieldValue || typeof fieldValue !== 'object';
  if (isPrimitive) {
    return fieldValue;
  }
  const isFileField = has(fieldValue, 'src');
  if (isFileField) {
    try {
      const src = await getDownloadURL(
        ref(fireWrapper.storage(), fieldValue.src)
      );
      return {
        ...fieldValue,
        src,
      };
    } catch (error) {
      logError(`Error when getting download URL`, {
        error,
      });
      return fieldValue;
    }
  }
  const isArray = Array.isArray(fieldValue);
  if (isArray) {
    const arrValue = fieldValue as any[];
    return Promise.all(
      (fieldValue as any[]).map(async (value, index) => {
        arrValue[index] = await recursivelyMapStorageUrls(fireWrapper, value);
      })
    );
  }
  const isDocumentReference = isInputADocReference(fieldValue);
  if (isDocumentReference) {
    return fieldValue;
  }
  const isObject = !isArray && typeof fieldValue === 'object';
  if (isObject) {
    const objValue = fieldValue as any;
    return Promise.all(
      Object.keys(fieldValue).map(async (key) => {
        const value = fieldValue[key];
        objValue[key] = await recursivelyMapStorageUrls(fireWrapper, value);
      })
    );
  }
};
