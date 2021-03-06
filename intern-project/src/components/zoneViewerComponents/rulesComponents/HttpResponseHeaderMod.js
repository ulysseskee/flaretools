import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Heading,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  HStack,
  VStack,
  Text,
  Divider,
} from "@chakra-ui/react";
import React from "react";
import { useTable } from "react-table";
import UnsuccessfulDefault from "../UnsuccessfulDefault";

const HttpResponseHeaderMod = (props) => {
  const GetExpressionOutput = (expr) => {
    if (/ip.geoip.country /.test(expr)) {
      return "Country";
    } else if (/ip.geoip.continent /.test(expr)) {
      return "Continent";
    } else if (/http.host /.test(expr)) {
      return "Hostname";
    } else if (/ip.geoip.asnum /.test(expr)) {
      return "AS Num";
    } else if (/http.cookie /.test(expr)) {
      return "Cookie";
    } else if (/ip.src /.test(expr)) {
      return "IP Source Address";
    } else if (/http.referer /.test(expr)) {
      return "Referer";
    } else if (/http.request.method /.test(expr)) {
      return "Request Method";
    } else if (/ssl /.test(expr)) {
      return "SSL/HTTPS";
    } else if (/http.request.full_uri /.test(expr)) {
      return "URI Full";
    } else if (/http.request.uri /.test(expr)) {
      return "URI";
    } else if (/http.request.uri.path /.test(expr)) {
      return "URI Path";
    } else if (/http.request.uri.query /.test(expr)) {
      return "URI Query";
    } else if (/http.request.version /.test(expr)) {
      return "HTTP Version";
    } else if (/http.user_agent /.test(expr)) {
      return "User Agent";
    } else if (/http.x_forwarded_for /.test(expr)) {
      return "X-Forwarded-For";
    } else if (/cf.tls_client_auth.cert_verified /.test(expr)) {
      return "Client Certificate Verified";
    } else if (/ip.geoip.is_in_european_union /.test(expr)) {
      return "European Union";
    } else {
      return expr;
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Priority",
        accessor: "priority",
      },
      {
        Header: "Description",
        accessor: (row) => {
          const exprs = row.expression.split(/\band\b|\bor\b/);
          const output = exprs.map((expr) => GetExpressionOutput(expr));
          return (
            <VStack w="100%" p={0} align={"flex-start"}>
              <Text>{row.description}</Text>
              <Text color="grey">{output.join(", ")}</Text>
            </VStack>
          );
        },
      },
      {
        Header: "Expression",
        accessor: "expression",
      },
      {
        Header: "Then...",
        accessor: (row) => {
          if (
            row?.action !== undefined &&
            row?.action_parameters !== undefined &&
            row.action_parameters?.headers !== undefined
          ) {
            const headersKeys = Object.keys(row.action_parameters.headers);
            const headersLength = headersKeys.length - 1;
            return headersKeys.map((header, index) => {
              const item = row.action_parameters.headers[header];
              return item?.expression !== undefined &&
                item?.operation !== undefined ? (
                <VStack w="100%" p={0} align={"flex-start"} key={header}>
                  <Text fontWeight={"bold"}>Operation: </Text>
                  <Text>{item.operation}</Text>
                  <Text fontWeight={"bold"}>Header name:</Text>
                  <Text>{header}</Text>
                  <Text fontWeight={"bold"}>Expression: </Text>
                  <Text>{item.expression}</Text>
                  {(index !== 0 && index !== headersLength) ||
                  (headersLength !== 0 && index !== headersLength) ? (
                    <Divider />
                  ) : null}
                </VStack>
              ) : item?.value !== undefined && item?.operation !== undefined ? (
                <VStack w="100%" p={0} align={"flex-start"} key={header}>
                  <Text fontWeight={"bold"}>Operation: </Text>
                  <Text>{item.operation}</Text>
                  <Text fontWeight={"bold"}>Header name:</Text>
                  <Text>{header}</Text>
                  <Text fontWeight={"bold"}>Value: </Text>
                  <Text>{item.value}</Text>
                  {(index !== 0 && index !== headersLength) ||
                  (headersLength !== 0 && index !== headersLength) ? (
                    <Divider />
                  ) : null}
                </VStack>
              ) : null;
            });
          }
        },
      },
      {
        Header: "Status",
        accessor: "enabled",
        Cell: (props) =>
          props.value ? (
            <CheckIcon color={"green"} />
          ) : (
            <CloseIcon color={"red"} />
          ),
      },
    ],
    []
  );

  const makeData = (data) => {
    if (data === undefined) {
      return [];
    }

    let priorityCounter = 1;
    data.forEach((row) => {
      row.priority = priorityCounter;
      priorityCounter++;
    });
    return data;
  };

  const data = React.useMemo(
    () => (props.data.result ? makeData(props.data.result.rules) : []),
    [props.data.result]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <Stack w="100%" spacing={4}>
      <HStack w="100%" spacing={4}>
        <Heading size="md" id={props.id}>
          HTTP Response Header Modification
        </Heading>
        {/*props.data.result?.rules === undefined && (
          <Switch isReadOnly isChecked={false} />
        )*/}
      </HStack>
      {props.data.result?.rules === undefined && (
        <UnsuccessfulDefault setting="HTTP Response Header Modification" />
      )}
      {props.data.result?.rules !== undefined && (
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

export default HttpResponseHeaderMod;
