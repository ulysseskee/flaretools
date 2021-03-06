import React, { useEffect, useState } from "react";
import { Container, Heading, Stack } from "@chakra-ui/react";
import PageRules from "./PageRules";
import UrlRewrite from "./UrlRewrite";
import HttpRequestHeaderMod from "./HttpRequestHeaderMod";
import HttpResponseHeaderMod from "./HttpResponseHeaderMod";
import RulesSubcategories from "./RulesSubcategories";
import { useZoneContext } from "../../../lib/contextLib";
import { getZoneSetting } from "../../../utils/utils";
import LoadingBox from "../../LoadingBox";

/**
 *
 * @param {*} props
 * @returns
 */

const RulesViewer = (props) => {
  const { zoneId, apiToken } = useZoneContext();
  const [rulesData, setRulesData] = useState();

  useEffect(() => {
    async function getData() {
      const resp = await getZoneSetting(
        {
          zoneId: zoneId,
          apiToken: `Bearer ${apiToken}`,
        },
        "/rules"
      );
      setRulesData(resp);
    }
    setRulesData();
    getData();
  }, [apiToken, zoneId]);

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
        <Heading size="xl">Rules</Heading>
        {rulesData ? (
          <PageRules id="page_rules" data={rulesData.pagerules} />
        ) : (
          <LoadingBox />
        )}
        {rulesData ? (
          <UrlRewrite id="url_rewrite" data={rulesData.url_rewrite} />
        ) : (
          <LoadingBox />
        )}
        {rulesData ? (
          <HttpRequestHeaderMod
            id="http_request_header_modification"
            data={rulesData.http_request_late_modification}
          />
        ) : (
          <LoadingBox />
        )}
        {rulesData ? (
          <HttpResponseHeaderMod
            id="http_response_header_modification"
            data={rulesData.http_response_headers_modification}
          />
        ) : (
          <LoadingBox />
        )}
        {rulesData ? (
          <RulesSubcategories
            id="normalization_settings"
            // data={rulesData.normalization_settings}
          />
        ) : (
          <LoadingBox />
        )}
      </Stack>
    </Container>
  );
};

export default React.memo(RulesViewer);
