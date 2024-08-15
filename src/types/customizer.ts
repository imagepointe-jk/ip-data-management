export type PlacedObject = {
  editorGuid: string; //the GUID for use within the editor. Needed to distinguish objects, e.g. when two of the same artwork are present.
  position: {
    x: number; //range 0-1
    y: number; //range 0-1
  };
  size: {
    x: number; //range 0-1
    y: number; //range 0-1
  };
  rotationDegrees: number;
};
