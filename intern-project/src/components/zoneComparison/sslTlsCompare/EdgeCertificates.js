import {
  Heading,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tag,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useTable } from "react-table";
import { useCompareContext } from "../../../lib/contextLib";
import {
  CategoryTitle,
  CompareBaseToOthers,
  CompareData,
  getMultipleZoneSettings,
  HeaderFactory,
  Humanize,
  UnsuccessfulHeaders,
} from "../../../utils/utils";
import LoadingBox from "../../LoadingBox";

const conditionsToMatch = (base, toCompare) => {
  // to be implemented
  const checkHosts = (base, toCompare) => {
    base.hosts.forEach((host) => {
      if (toCompare.hosts.includes(host) === false) {
        return false;
      }
    });
    return true;
  };

  const checkExpiry = (base, toCompare) => {
    return (
      base.certificates[0].expires_on === toCompare.certificates[0].expires_on
    );
  };

  const checkSignature = (base, toCompare) => {
    if (base.certificates.length !== toCompare.certificates.length) {
      return false;
    } else {
      for (let i = 0; i < base.certificates.length; i++) {
        if (
          base.certificates[i].signature !== toCompare.certificates[i].signature
        ) {
          return false;
        }
      }
      return true;
    }
  };
  return (
    checkHosts(base, toCompare) && // hosts
    checkExpiry(base, toCompare) && // certificates->expiry
    checkSignature(base, toCompare) && // certificates->signature
    base.type === toCompare.type && // type
    base.status === toCompare.status // status
  );
};

const EdgeCertificates = (props) => {
  const { zoneKeys, credentials } = useCompareContext();
  const [edgeCertificatesData, setEdgeCertificatesData] = useState();

  useEffect(() => {
    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/ssl/certificate_packs"
      );
      const processedResp = resp.map((zone) => zone.resp);
      setEdgeCertificatesData(processedResp);
    }
    setEdgeCertificatesData();
    getData();
  }, [credentials, zoneKeys]);

  const columns = React.useMemo(() => {
    const baseHeaders = [
      {
        Header: "Hosts",
        accessor: "hosts",
        Cell: (props) => {
          return props.value.join(", ");
        },
      },
      {
        Header: "Type",
        accessor: "type",
        Cell: (props) => Humanize(props.value),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: (props) => (
          <Tag colorScheme={"green"}>{Humanize(props.value)}</Tag>
        ),
      },
      {
        Header: "Expires On",
        accessor: (row) => row.certificates[0].expires_on,
        Cell: (props) => props.value.substring(0, 10),
      },
    ];

    const dynamicHeaders = edgeCertificatesData
      ? HeaderFactory(edgeCertificatesData.length)
      : [];

    return edgeCertificatesData &&
      edgeCertificatesData[0].success &&
      edgeCertificatesData[0].result.length
      ? baseHeaders.concat(dynamicHeaders)
      : UnsuccessfulHeaders.concat(dynamicHeaders);
  }, [edgeCertificatesData]);

  //   const makeData = (data) => {
  //     return data.map((row) => {
  //       const dataObj = {
  //         hosts: row.hosts,
  //         type: row.type,
  //         status: row.status,
  //         expires_on: row.certificates[0].expires_on,
  //       };
  //       return dataObj;
  //     });
  //   };

  const data = React.useMemo(
    () =>
      edgeCertificatesData
        ? CompareData(
            CompareBaseToOthers,
            edgeCertificatesData,
            conditionsToMatch,
            "Edge Certificates"
          )
        : [],
    [edgeCertificatesData]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <Stack w="100%" spacing={4}>
      {<CategoryTitle id={props.id} copyable={false} />}
      {!edgeCertificatesData && <LoadingBox />}
      {edgeCertificatesData && (
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

export default EdgeCertificates;
