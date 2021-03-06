import React from "react";
import { Container, Heading, Stack } from "@chakra-ui/react";
import SpeedSubcategories from "./SpeedSubcategories";
import AutomaticPlatformOptimization from "./AutomaticPlatformOptimization";
import MobileRedirect from "./MobileRedirect";
import Minify from "./Minify";
import Railgun from "./Railgun";

/**
 *
 * @param {*} props
 * @returns
 */

const SpeedCompare = (props) => {
  return (
    <Container maxW="container.xl">
      <Stack
        spacing={8}
        borderColor="#ccc"
        borderWidth={0.1}
        borderRadius={10}
        padding={8}
        margin={8}
        boxShadow="0 0 3px #ccc"
      >
        <Heading size="xl">Speed</Heading>
        <AutomaticPlatformOptimization id="automatic_platform_optimization" />
        <MobileRedirect id="mobile_redirect" />
        <Minify id="minify" />
        <Railgun id="railguns" />
        <SpeedSubcategories id="speed_subcategories" />
      </Stack>
    </Container>
  );
};

export default React.memo(SpeedCompare);
