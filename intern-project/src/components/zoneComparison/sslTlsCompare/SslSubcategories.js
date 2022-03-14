import {
  Heading,
  Stack,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  CompareBaseToOthersCategorical,
  CompareData,
  getMultipleZoneSettings,
  HeaderFactoryOverloaded,
  Humanize,
} from "../../../utils/utils";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useCompareContext } from "../../../lib/contextLib";
import { useTable } from "react-table";
import LoadingBox from "../../LoadingBox";

const convertOutput = (value) => {
  return value === true ? (
    <Tag colorScheme={"green"}>Match</Tag>
  ) : value === false ? (
    <Tag colorScheme={"red"}>No Match</Tag>
  ) : (
    value
  );
};

const returnConditions = (data) => {
  if (data.success === false) {
    return data.messages[0];
  } else if (data.result?.certificate_authority !== undefined) {
    return data.result["certificate_authority"];
  } else if (data.result.value === "on") {
    return true;
  } else if (data.result.value === "off") {
    return false;
  } else {
    return data.result.value;
  }
};

const SslSubcategories = (props) => {
  const { zoneKeys, credentials } = useCompareContext();
  const [sslSubcategoriesData, setSslSubcategoriesData] = useState();

  useEffect(() => {
    async function getData() {
      const resp = await Promise.all([
        getMultipleZoneSettings(zoneKeys, credentials, "/ssl/recommendation"),
        getMultipleZoneSettings(
          zoneKeys,
          credentials,
          "/settings/always_use_https"
        ),
        getMultipleZoneSettings(
          zoneKeys,
          credentials,
          "/settings/min_tls_version"
        ),
        getMultipleZoneSettings(
          zoneKeys,
          credentials,
          "/settings/opportunistic_encryption"
        ),
        getMultipleZoneSettings(zoneKeys, credentials, "/settings/tls_1_3"),
        getMultipleZoneSettings(
          zoneKeys,
          credentials,
          "/settings/automatic_https_rewrites"
        ),
        getMultipleZoneSettings(
          zoneKeys,
          credentials,
          "/ssl/universal/settings"
        ),
        getMultipleZoneSettings(
          zoneKeys,
          credentials,
          "/settings/tls_client_auth"
        ),
      ]);
      const processedResp = resp.map((settingArray) =>
        settingArray.map((zone) => zone.resp)
      );
      setSslSubcategoriesData(processedResp);
    }
    setSslSubcategoriesData();
    getData();
  }, [credentials, zoneKeys]);

  const columns = React.useMemo(() => {
    const baseHeaders = [
      {
        Header: "Setting",
        accessor: "setting",
        Cell: (props) => Humanize(props.value),
      },
      {
        Header: "Value",
        accessor: "value",
        Cell: (props) =>
          props.value === true ? (
            <CheckIcon color={"green"} />
          ) : props.value === false ? (
            <CloseIcon color={"red"} />
          ) : (
            props.value
          ),
      },
    ];
    const dynamicHeaders =
      sslSubcategoriesData && sslSubcategoriesData.length
        ? HeaderFactoryOverloaded(sslSubcategoriesData[0].length, convertOutput)
        : [];

    return sslSubcategoriesData ? baseHeaders.concat(dynamicHeaders) : [];
  }, [sslSubcategoriesData]);

  const data = React.useMemo(
    () =>
      sslSubcategoriesData
        ? sslSubcategoriesData.map((data) => {
            return CompareData(
              CompareBaseToOthersCategorical,
              data,
              returnConditions,
              data[0].result?.id !== undefined
                ? data[0].result.id
                : "ssl_universal"
            );
          })
        : [],
    [sslSubcategoriesData]
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <Stack w="100%" spacing={4}>
      <Heading size="md" id={props.id}>
        SSL Subcategories
      </Heading>
      {!sslSubcategoriesData && <LoadingBox />}
      {sslSubcategoriesData && (
        <Table {...getTableProps}>
          <Thead>
            {
              // Loop over the header rows
              headerGroups.map((headerGroup) => (
                <Tr {...headerGroup.getHeaderGroupProps()}>
                  {
                    // Loop over the headers in each row
                    headerGroup.headers.map((column) => (
                      // Apply the header cell props
                      <Th {...column.getHeaderProps()}>
                        {
                          // Render the header
                          column.render("Header")
                        }
                      </Th>
                    ))
                  }
                </Tr>
              ))
            }
          </Thead>
          {/* Apply the table body props */}
          <Tbody {...getTableBodyProps()}>
            {
              // Loop over the table rows
              rows.map((row) => {
                // Prepare the row for display
                prepareRow(row);
                return (
                  // Apply the row props
                  <Tr {...row.getRowProps()}>
                    {
                      // Loop over the rows cells
                      row.cells.map((cell) => {
                        // Apply the cell props
                        return (
                          <Td {...cell.getCellProps()}>
                            {
                              // Render the cell contents
                              cell.render("Cell")
                            }
                          </Td>
                        );
                      })
                    }
                  </Tr>
                );
              })
            }
          </Tbody>
        </Table>
      )}
    </Stack>
  );
};

export default SslSubcategories;
