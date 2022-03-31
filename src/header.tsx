import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useConvex } from "../convex/_generated";

import { keyframes, styled } from "@stitches/react";
import { violet, blackA } from "@radix-ui/colors";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import Separator from "../components/separator";
import Box from "../components/box";
import Flex from "../components/flex";
import Text from "../components/text";

const Avatar = styled(AvatarPrimitive.Root, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  overflow: "hidden",
  userSelect: "none",
  width: 45,
  height: 45,
  borderRadius: "100%",
  backgroundColor: blackA.blackA3,
});

const AvatarImage = styled(AvatarPrimitive.Image, {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
});

const AvatarFallback = styled(AvatarPrimitive.Fallback, {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: violet.violet11,
  color: "white",
  fontSize: 15,
  lineHeight: 1,
  fontWeight: 500,
});

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const StyledContent = styled(TooltipPrimitive.Content, {
  borderRadius: 4,
  padding: "10px 15px",
  fontSize: 15,
  lineHeight: 1,
  color: "white",
  backgroundColor: violet.violet11,
  boxShadow:
    "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
  "@media (prefers-reduced-motion: no-preference)": {
    animationDuration: "400ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "forwards",
    willChange: "transform, opacity",
    '&[data-state="delayed-open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

const StyledArrow = styled(TooltipPrimitive.Arrow, {
  fill: violet.violet11,
});

const Provider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = StyledContent;

const Header = (props: { children: JSX.Element }): JSX.Element => {
  const convex = useConvex();
  let { isLoading, isAuthenticated, getIdTokenClaims, user } = useAuth0();
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isAuthenticated) {
      getIdTokenClaims().then(async (claims) => {
        let token = claims!.__raw;
        convex.setAuth(token);
      });
    } else {
      convex.clearAuth();
    }
  }, [isAuthenticated, isLoading, getIdTokenClaims, convex]);

  let avatar;
  if (user?.name) {
    let avatarImage;
    if (user.picture) {
      avatarImage = <AvatarImage src={user.picture} alt={user.name} />;
    }
    const names = user.name.split(" ");
    const firstInitial = names[0][0];
    const lastInitial = names[names.length - 1][0];
    avatar = (
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar>
            {avatarImage}
            <AvatarFallback delayMs={600}>
              {firstInitial}
              {lastInitial}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <StyledContent sideOffset={5}>
          {user.name}
          <StyledArrow />
        </StyledContent>
      </Tooltip>
    );
  }
  return (
    <Box css={{ width: "100%", maxWidth: 600, margin: "0 15px" }}>
      <Flex css={{ flexDirection: "row" }}>
        <Box css={{ flexGrow: 1 }}>
          <Text css={{ fontWeight: 500 }}>🐎 &nbsp;Dinner Derby</Text>
          <Text>Choose where to go for dinner like a mayoral election.</Text>
        </Box>
        <Box>{avatar}</Box>
      </Flex>
      <Separator css={{ margin: "15px 0" }} />
      {props.children}
    </Box>
  );
};
export default Header;
