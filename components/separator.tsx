import { violet } from "@radix-ui/colors";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { styled } from "@stitches/react";

const Separator = styled(SeparatorPrimitive.Root, {
  backgroundColor: violet.violet6,
  "&[data-orientation=horizontal]": { height: 1, width: "100%" },
  "&[data-orientation=vertical]": { width: 1 },
});
export default Separator;
