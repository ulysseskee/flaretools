import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTable } from "react-table";
import { useCompareContext } from "../../../lib/contextLib";
import {
  CategoryTitle,
  CompareBaseToOthers,
  CompareData,
  getMultipleZoneSettings,
  getZoneSetting,
  HeaderFactory,
  HeaderFactoryWithTags,
  Humanize,
  putZoneSetting,
  UnsuccessfulHeadersWithTags,
} from "../../../utils/utils";
import LoadingBox from "../../LoadingBox";
import NonEmptyErrorModal from "../commonComponents/NonEmptyErrorModal";
import ProgressBarModal from "../commonComponents/ProgressBarModal";
import RecordsErrorPromptModal from "../commonComponents/RecordsErrorPromptModal";
import ReplaceBaseUrlSwitch from "../commonComponents/ReplaceBaseUrlSwitch";
import SuccessPromptModal from "../commonComponents/SuccessPromptModal";

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

const makeData = (data) => {
  let priorityCounter = 1;
  data.forEach((row) => {
    row.priority = priorityCounter;
    priorityCounter++;
  });
  return data;
};

const conditionsToMatch = (base, toCompare) => {
  return (
    base.action === toCompare.action &&
    _.isEqual(base.action_parameters, toCompare.action_parameters) &&
    base.enabled === toCompare.enabled &&
    base.expression === toCompare.expression &&
    base.priority === toCompare.priority
  );
};

const UrlRewrite = (props) => {
  const { zoneKeys, credentials, zoneDetails, zoneCopierFunctions } =
    useCompareContext();
  const [urlRewriteData, setUrlRewriteData] = useState();
  const {
    isOpen: NonEmptyErrorIsOpen,
    onOpen: NonEmptyErrorOnOpen,
    onClose: NonEmptyErrorOnClose,
  } = useDisclosure(); // NonEmptyErrorModal;
  const {
    isOpen: ErrorPromptIsOpen,
    onOpen: ErrorPromptOnOpen,
    onClose: ErrorPromptOnClose,
  } = useDisclosure(); // RecordsBasedErrorPromptModal;
  const {
    isOpen: SuccessPromptIsOpen,
    onOpen: SuccessPromptOnOpen,
    onClose: SuccessPromptOnClose,
  } = useDisclosure(); // SuccessPromptModal;
  const {
    isOpen: CopyingProgressBarIsOpen,
    onOpen: CopyingProgressBarOnOpen,
    onClose: CopyingProgressBarOnClose,
  } = useDisclosure(); // ProgressBarModal -- Copying;
  const [currentZone, setCurrentZone] = useState();
  const [numberOfZonesToCopy, setNumberOfZonesToCopy] = useState(0);
  const [numberOfZonesCopied, setNumberOfZonesCopied] = useState(0);
  const [errorPromptList, setErrorPromptList] = useState([]);
  const [replaceBaseUrl, setReplaceBaseUrl] = useState(false);

  useEffect(() => {
    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/rulesets/phases/http_request_transform/entrypoint"
      );
      const processedResp = resp.map((zone) => {
        const newObj = { ...zone.resp };
        newObj["result"] =
          zone.resp.result?.rules !== undefined
            ? makeData(zone.resp.result.rules)
            : [];
        return newObj;
      });
      setUrlRewriteData(processedResp);
    }
    setUrlRewriteData();
    getData();
  }, [credentials, zoneKeys]);

  const columns = React.useMemo(() => {
    const baseHeaders = [
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
        maxWidth: 150,
      },
      {
        Header: "Expression",
        accessor: "expression",
        maxWidth: 150,
      },
      {
        Header: "Then...",
        accessor: (row) => {
          if (
            row?.action !== undefined &&
            row?.action_parameters !== undefined &&
            row.action_parameters?.uri !== undefined
          ) {
            return (
              <VStack w="100%" p={0} align={"flex-start"}>
                {row.action_parameters.uri?.path !== undefined ? (
                  <>
                    <Text fontWeight={"bold"}>{`${Humanize(
                      row.action
                    )} Path: `}</Text>
                    <Text>{`${row.action_parameters.uri.path.value}`}</Text>
                  </>
                ) : null}
                {row.action_parameters.uri?.query !== undefined ? (
                  <>
                    <Text fontWeight={"bold"}>{`${Humanize(
                      row.action
                    )} Query: `}</Text>
                    <Text>{`${row.action_parameters.uri.query.value}`}</Text>
                  </>
                ) : null}
              </VStack>
            );
          } else {
            return null;
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
    ];

    const dynamicHeaders =
      urlRewriteData && urlRewriteData[0].result.length
        ? HeaderFactory(urlRewriteData.length)
        : urlRewriteData && urlRewriteData[0].result.length === 0
        ? HeaderFactoryWithTags(urlRewriteData.length, false)
        : [];

    return urlRewriteData &&
      urlRewriteData[0].success &&
      urlRewriteData[0].result.length
      ? baseHeaders.concat(dynamicHeaders)
      : UnsuccessfulHeadersWithTags.concat(dynamicHeaders);
  }, [urlRewriteData]);

  const data = React.useMemo(
    () =>
      urlRewriteData
        ? CompareData(
            CompareBaseToOthers,
            urlRewriteData,
            conditionsToMatch,
            "URL Rewrite"
          )
        : [],
    [urlRewriteData]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const handleDelete = async (data, zoneKeys, credentials) => {
    if (NonEmptyErrorIsOpen) {
      NonEmptyErrorOnClose();
    }

    async function sendPostRequest(data, endpoint) {
      const resp = await putZoneSetting(data, endpoint);
      return resp;
    }

    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/rulesets/phases/http_request_transform/entrypoint"
      );
      const processedResp = resp.map((zone) => {
        const newObj = { ...zone.resp };
        newObj["result"] =
          zone.resp.result?.rules !== undefined
            ? makeData(zone.resp.result.rules)
            : [];
        return newObj;
      });
      setUrlRewriteData(processedResp);
    }

    let errorCount = 0;
    setErrorPromptList([]);

    SuccessPromptOnClose();
    // not possible for data not to be loaded (logic is at displaying this button)

    const baseZoneData = data[0].result.map((record) => {
      const newObj = {
        action: record.action,
        action_parameters: record.action_parameters,
        expression: record.expression,
        enabled: record.enabled,
        version: record.version,
        description: record.description,
      };
      return newObj;
    });
    const otherZoneKeys = zoneKeys.slice(1);

    setNumberOfZonesCopied(0);
    setNumberOfZonesToCopy(otherZoneKeys.length);

    for (const key of otherZoneKeys) {
      setCurrentZone(key);
      if (!CopyingProgressBarIsOpen) {
        CopyingProgressBarOnOpen();
      }

      const replacedUrlData = replaceBaseUrl
        ? baseZoneData.map((record) => {
            record.expression = record.expression.replaceAll(
              zoneDetails["zone_1"].name,
              zoneDetails[key].name
            );
            return record;
          })
        : baseZoneData;

      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };
      const dataWithAuth = { ...authObj, data: { rules: replacedUrlData } };
      const { resp: postRequestResp } = await sendPostRequest(
        dataWithAuth,
        "/put/rulesets/phases/http_request_transform/entrypoint"
      );
      if (postRequestResp.success === false) {
        const errorObj = {
          code: postRequestResp.errors[0].code,
          message: postRequestResp.errors[0].message,
          data: "",
        };
        errorCount += 1;
        setErrorPromptList((prev) => [...prev, errorObj]);
      }
      setNumberOfZonesCopied((prev) => prev + 1);
    }
    CopyingProgressBarOnClose();

    // if there is some error at the end of copying, show the records that
    // were not copied
    if (errorCount > 0) {
      ErrorPromptOnOpen();
    } else {
      SuccessPromptOnOpen();
    }
    setUrlRewriteData();
    getData();
  };

  const putDataFromBaseToOthers = async (data, zoneKeys, credentials) => {
    async function sendPostRequest(data, endpoint) {
      const resp = await putZoneSetting(data, endpoint);
      return resp;
    }

    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/rulesets/phases/http_request_transform/entrypoint"
      );
      const processedResp = resp.map((zone) => {
        const newObj = { ...zone.resp };
        newObj["result"] =
          zone.resp.result?.rules !== undefined
            ? makeData(zone.resp.result.rules)
            : [];
        return newObj;
      });
      setUrlRewriteData(processedResp);
    }

    let errorCount = 0;
    setErrorPromptList([]);

    SuccessPromptOnClose();
    // not possible for data not to be loaded (logic is at displaying this button)

    const baseZoneData = data[0].result.map((record) => {
      const newObj = {
        action: record.action,
        action_parameters: record.action_parameters,
        expression: record.expression,
        enabled: record.enabled,
        version: record.version,
        description: record.description,
      };
      return newObj;
    });
    const otherZoneKeys = zoneKeys.slice(1);

    for (const key of otherZoneKeys) {
      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };
      const { resp: checkIfEmpty } = await getZoneSetting(
        authObj,
        "/rulesets/phases/http_request_transform/entrypoint"
      );

      if (checkIfEmpty.success === true && checkIfEmpty.result.length !== 0) {
        setCurrentZone(key);
        NonEmptyErrorOnOpen();
        return;
      }
    }

    setNumberOfZonesCopied(0);
    setNumberOfZonesToCopy(otherZoneKeys.length);

    for (const key of otherZoneKeys) {
      setCurrentZone(key);
      if (!CopyingProgressBarIsOpen) {
        CopyingProgressBarOnOpen();
      }

      const replacedUrlData = replaceBaseUrl
        ? baseZoneData.map((record) => {
            record.expression = record.expression.replaceAll(
              zoneDetails["zone_1"].name,
              zoneDetails[key].name
            );
            return record;
          })
        : baseZoneData;

      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };
      const dataWithAuth = { ...authObj, data: { rules: replacedUrlData } };
      const { resp: postRequestResp } = await sendPostRequest(
        dataWithAuth,
        "/put/rulesets/phases/http_request_transform/entrypoint"
      );
      if (postRequestResp.success === false) {
        const errorObj = {
          code: postRequestResp.errors[0].code,
          message: postRequestResp.errors[0].message,
          data: "",
        };
        errorCount += 1;
        setErrorPromptList((prev) => [...prev, errorObj]);
      }
      setNumberOfZonesCopied((prev) => prev + 1);
    }
    CopyingProgressBarOnClose();

    // if there is some error at the end of copying, show the records that
    // were not copied
    if (errorCount > 0) {
      ErrorPromptOnOpen();
    } else {
      SuccessPromptOnOpen();
    }
    setUrlRewriteData();
    getData();
  };

  const bulkCopyHandler = async (
    data,
    zoneKeys,
    credentials,
    setResults,
    setProgress
  ) => {
    setProgress((prevState) => {
      // trigger spinner on UI
      const newState = {
        ...prevState,
        [props.id]: {
          ...prevState[props.id],
          completed: false,
        },
      };
      return newState;
    });

    // initialize state
    setResults((prevState) => {
      const newState = {
        ...prevState,
        [props.id]: {
          ...prevState[props.id],
          errors: [],
          copied: [],
        },
      };
      return newState;
    });

    async function sendPostRequest(data, endpoint) {
      const resp = await putZoneSetting(data, endpoint);
      return resp;
    }

    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/rulesets/phases/http_request_transform/entrypoint"
      );
      const processedResp = resp.map((zone) => {
        const newObj = { ...zone.resp };
        newObj["result"] =
          zone.resp.result?.rules !== undefined
            ? makeData(zone.resp.result.rules)
            : [];
        return newObj;
      });
      setUrlRewriteData(processedResp);
    }

    // not possible for data not to be loaded (logic is at displaying this button)

    const baseZoneData = data[0].result.map((record) => {
      const newObj = {
        action: record.action,
        action_parameters: record.action_parameters,
        expression: record.expression,
        enabled: record.enabled,
        version: record.version,
        description: record.description,
      };
      return newObj;
    });
    const otherZoneKeys = zoneKeys.slice(1);

    // initialize state
    setProgress((prevState) => {
      const newState = {
        ...prevState,
        [props.id]: {
          ...prevState[props.id],
          status: "copy",
          totalToCopy: otherZoneKeys.length,
          progressTotal: 0,
          completed: false,
        },
      };
      return newState;
    });

    for (const key of otherZoneKeys) {
      // setCurrentZone(key);

      const replacedUrlData = replaceBaseUrl
        ? baseZoneData.map((record) => {
            record.expression = record.expression.replaceAll(
              zoneDetails["zone_1"].name,
              zoneDetails[key].name
            );
            return record;
          })
        : baseZoneData;

      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };
      const dataWithAuth = { ...authObj, data: { rules: replacedUrlData } };
      const { resp: postRequestResp } = await sendPostRequest(
        dataWithAuth,
        "/put/rulesets/phases/http_request_transform/entrypoint"
      );
      if (postRequestResp.success === false) {
        const errorObj = {
          code: postRequestResp.errors[0].code,
          message: postRequestResp.errors[0].message,
          data: "",
        };
        setResults((prevState) => {
          const newState = {
            ...prevState,
            [props.id]: {
              ...prevState[props.id],
              errors: prevState[props.id]["errors"].concat(errorObj),
            },
          };
          return newState;
        });
      } else {
        setResults((prevState) => {
          const newState = {
            ...prevState,
            [props.id]: {
              ...prevState[props.id],
              copied: prevState[props.id]["copied"].concat(replacedUrlData),
            },
          };
          return newState;
        });
      }
      setProgress((prevState) => {
        const newState = {
          ...prevState,
          [props.id]: {
            ...prevState[props.id],
            progressTotal: prevState[props.id]["progressTotal"] + 1,
          },
        };
        return newState;
      });
    }
    setUrlRewriteData();
    getData();

    setProgress((prevState) => {
      const newState = {
        ...prevState,
        [props.id]: {
          ...prevState[props.id],
          completed: true,
        },
      };
      return newState;
    });
    return;
  };

  if (!urlRewriteData) {
  } // don't do anything while the app has not loaded
  else if (
    urlRewriteData &&
    urlRewriteData[0].success &&
    urlRewriteData[0].result.length
  ) {
    zoneCopierFunctions[props.id] = (setResults, setProgress) =>
      bulkCopyHandler(
        urlRewriteData,
        zoneKeys,
        credentials,
        setResults,
        setProgress
      );
  } else {
    zoneCopierFunctions[props.id] = false;
  }

  return (
    <Stack w="100%" spacing={4}>
      {
        <CategoryTitle
          id={props.id}
          copyable={true}
          showCopyButton={
            urlRewriteData &&
            urlRewriteData[0].success &&
            urlRewriteData[0].result.length
          }
          copy={() =>
            putDataFromBaseToOthers(urlRewriteData, zoneKeys, credentials)
          }
        />
      }
      <ReplaceBaseUrlSwitch
        switchText="Replace Base Zone Hostname"
        switchState={replaceBaseUrl}
        changeSwitchState={setReplaceBaseUrl}
      />
      {NonEmptyErrorIsOpen && (
        <NonEmptyErrorModal
          isOpen={NonEmptyErrorIsOpen}
          onOpen={NonEmptyErrorOnOpen}
          onClose={NonEmptyErrorOnClose}
          handleDelete={() =>
            handleDelete(urlRewriteData, zoneKeys, credentials)
          }
          title={`There are some existing records in ${zoneDetails[currentZone].name}`}
          errorMessage={`To proceed with copying ${Humanize(props.id)} from ${
            zoneDetails.zone_1.name
          } 
          to ${zoneDetails[currentZone].name}, the existing records 
          in ${
            zoneDetails[currentZone].name
          } need to be deleted. This action is irreversible.`}
        />
      )}
      {ErrorPromptIsOpen && (
        <RecordsErrorPromptModal
          isOpen={ErrorPromptIsOpen}
          onOpen={ErrorPromptOnOpen}
          onClose={ErrorPromptOnClose}
          title={`Error`}
          errorList={errorPromptList}
        />
      )}
      {SuccessPromptIsOpen && (
        <SuccessPromptModal
          isOpen={SuccessPromptIsOpen}
          onOpen={SuccessPromptOnOpen}
          onClose={SuccessPromptOnClose}
          title={`${Humanize(props.id)} successfully copied`}
          successMessage={`Your ${Humanize(
            props.id
          )} settings have been successfully copied
          from ${zoneDetails.zone_1.name} to ${zoneDetails[currentZone].name}.`}
        />
      )}
      {CopyingProgressBarIsOpen && (
        <ProgressBarModal
          isOpen={CopyingProgressBarIsOpen}
          onOpen={CopyingProgressBarOnOpen}
          onClose={CopyingProgressBarOnClose}
          title={`Your rules for ${Humanize(props.id)} is being copied from ${
            zoneDetails.zone_1.name
          } to ${zoneDetails[currentZone].name}`}
          progress={numberOfZonesCopied}
          total={numberOfZonesToCopy}
        />
      )}
      {!urlRewriteData && <LoadingBox />}
      {urlRewriteData && (
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
                      <Th
                        {...column.getHeaderProps({
                          style: {
                            maxWidth: column.maxWidth,
                          },
                        })}
                      >
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
                          <Td
                            {...cell.getCellProps({
                              style: {
                                maxWidth: cell.column.maxWidth,
                              },
                            })}
                          >
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

export default UrlRewrite;
