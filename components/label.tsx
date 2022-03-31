import * as LabelPrimitive from "@radix-ui/react-label";
import { styled } from "@stitches/react";

const Label = styled(LabelPrimitive.Root, {
  fontSize: 15,
  fontWeight: 500,
  color: "black",
  userSelect: "none",
});
export default Label;
