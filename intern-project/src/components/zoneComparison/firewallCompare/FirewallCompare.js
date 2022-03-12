import { Container, Heading, Stack } from "@chakra-ui/react";
import React from "react";
import FirewallSubcategories from "./FirewallSubcategories";
import RateLimiting from "./RateLimiting";
import UserAgentBlocking from "./UserAgentBlocking";
import ZoneLockdown from "./ZoneLockdown";

const FirewallViewer = (props) => {
  //   const { zoneId, apiToken } = useZoneContext();
  //   const [firewallData, setFirewallData] = useState();
  //   const [ddosId, setDdosId] = useState();

  //   const getRulesetId = (name, resultArray) => {
  //     for (let i = 0; i < resultArray.length; i++) {
  //       if (resultArray[i].name === name) {
  //         return i;
  //       }
  //     }
  //     return -1;
  //   };

  //   useEffect(() => {
  //     async function getFirewallData() {
  //       const firewallResults = await getZoneSetting(
  //         {
  //           zoneId: zoneId,
  //           apiToken: `Bearer ${apiToken}`,
  //         },
  //         "/firewall"
  //       );
  //       setFirewallData((prevState) => ({
  //         ...prevState,
  //         ...firewallResults,
  //       }));

  //       // check deprecated firewall rules
  //       const deprecatedFirewall = await getZoneSetting(
  //         {
  //           zoneId: zoneId,
  //           apiToken: `Bearer ${apiToken}`,
  //         },
  //         "/firewall/deprecated"
  //       );
  //       setFirewallData((prevState) => ({
  //         ...prevState,
  //         ...deprecatedFirewall,
  //       }));

  //       return firewallResults;
  //     }
  //     setFirewallData();
  //     setDdosId();
  //     getFirewallData().then((data) => {
  //       const tempDdosId = getRulesetId(
  //         "DDoS L7 ruleset",
  //         data.managed_rulesets_results
  //       );
  //       setDdosId(tempDdosId);
  //     });
  //   }, [apiToken, zoneId]);

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
        <Heading size="xl">Firewall</Heading>
        {/* {firewallData?.waf_setting &&
        "deprecatedFirewallRules" in firewallData ? (
          <WebAppFirewall
            data={{
              waf_setting: firewallData.waf_setting,
              managed_rulesets_results: firewallData.managed_rulesets_results,
              deprecated_firewall_rules: firewallData.deprecatedFirewallRules,
            }}
          />
        ) : (
          <LoadingBox />
        )} */}
        {/* {firewallData?.custom_rules_firewall &&
        firewallData.custom_rules_firewall.success ? (
          <CustomRules
            data={firewallData.custom_rules_firewall}
            title="Custom Rules Firewall"
          />
        ) : (
          firewallData &&
          !("custom_rules_firewall" in firewallData) && <LoadingBox />
        )} */}
        {/* {firewallData?.custom_rules_ratelimit &&
        firewallData.custom_rules_ratelimit.success ? (
          <CustomRules
            data={firewallData.custom_rules_ratelimit}
            title="Custom Rules Rate Limit"
          />
        ) : (
          firewallData &&
          !("custom_rules_ratelimit" in firewallData) && <LoadingBox />
        )} */}
        {/* {firewallData?.firewall_rules ? (
          <FirewallRules data={firewallData.firewall_rules} />
        ) : (
          <LoadingBox />
        )} */}
        {/* {firewallData?.ddos_l7 &&
        firewallData?.managed_rulesets_results[ddosId] &&
        firewallData.managed_rulesets_results[ddosId].id ===
          "4d21379b4f9f4bb088e0729962c8b3cf" ? (
          <DdosProtection
            data={{
              ddos_l7: firewallData.ddos_l7,
              ddos_ruleset: firewallData.managed_rulesets_results[ddosId],
            }}
            title="HTTP DDoS attack protection"
          />
        ) : (
          <LoadingBox />
        )} */}
        {/* {firewallData?.firewall_access_rules ? (
          <IpAccessRules data={firewallData.firewall_access_rules} />
        ) : (
          <LoadingBox />
        )} */}
        <RateLimiting />
        <UserAgentBlocking />
        <ZoneLockdown />
        <FirewallSubcategories />
      </Stack>
    </Container>
  );
};

export default React.memo(FirewallViewer);
