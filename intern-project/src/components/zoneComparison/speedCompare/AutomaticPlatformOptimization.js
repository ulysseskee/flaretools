import {
  Stack,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  CategoryTitle,
  CompareBaseToOthersCategorical,
  CompareData,
  getMultipleZoneSettings,
  HeaderFactoryOverloaded,
  Humanize,
  patchZoneSetting,
} from "../../../utils/utils";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useCompareContext } from "../../../lib/contextLib";
import { useTable } from "react-table";
import LoadingBox from "../../LoadingBox";
import _ from "lodash";
import ErrorPromptModal from "../commonComponents/ErrorPromptModal";
import SuccessPromptModal from "../commonComponents/SuccessPromptModal";

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
  } else if (
    data.result.id === "enabled" &&
    typeof data.result.value === "object"
  ) {
    return data.result.value.enabled ? true : false;
  } else if (data.result.value === "off") {
    return false;
  } else if (
    data.result.id === "cache_by_device_type" &&
    data.result.value?.cache_by_device_type !== undefined
  ) {
    return data.result.value.cache_by_device_type;
  } else if (
    data.result.id === "cache_by_device_type" &&
    data.result.value?.cache_by_device_type === undefined
  ) {
    return false;
  } else {
    return data.result.value;
  }
};

const AutomaticPlatformOptimization = (props) => {
  const { zoneKeys, credentials, zoneDetails, zoneCopierFunctions } =
    useCompareContext();
  const [
    automaticPlatformOptimizationData,
    setAutomaticPlatformOptimizationData,
  ] = useState();
  const {
    isOpen: ErrorPromptIsOpen,
    onOpen: ErrorPromptOnOpen,
    onClose: ErrorPromptOnClose,
  } = useDisclosure(); // ErrorPromptModal;
  const {
    isOpen: SuccessPromptIsOpen,
    onOpen: SuccessPromptOnOpen,
    onClose: SuccessPromptOnClose,
  } = useDisclosure(); // SuccessPromptModal;
  const [currentZone, setCurrentZone] = useState();

  useEffect(() => {
    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/settings/automatic_platform_optimization"
      );
      const resp2 = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/settings/automatic_platform_optimization"
      );
      const valueResp = resp.map((zone) => {
        const newObj = { ...zone.resp };
        newObj.result.id = "enabled";
        return newObj;
      });
      const cacheByDeviceTypeResp = resp2.map((zone) => {
        const newObj = { ...zone.resp };
        newObj.result.id = "cache_by_device_type";
        return newObj;
      });
      const secondaryProcessedResp = [
        [...valueResp],
        [...cacheByDeviceTypeResp],
      ];
      setAutomaticPlatformOptimizationData(secondaryProcessedResp);
    }
    setAutomaticPlatformOptimizationData();
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
      automaticPlatformOptimizationData &&
      automaticPlatformOptimizationData.length
        ? HeaderFactoryOverloaded(
            automaticPlatformOptimizationData[0].length,
            convertOutput
          )
        : [];

    return automaticPlatformOptimizationData
      ? baseHeaders.concat(dynamicHeaders)
      : [];
  }, [automaticPlatformOptimizationData]);

  const data = React.useMemo(
    () =>
      automaticPlatformOptimizationData
        ? automaticPlatformOptimizationData.map((data) => {
            return CompareData(
              CompareBaseToOthersCategorical,
              data,
              returnConditions,
              data[0].result.id
            );
          })
        : [],
    [automaticPlatformOptimizationData]
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const patchDataFromBaseToOthers = async (data, zoneKeys, credentials) => {
    async function sendPostRequest(data, endpoint) {
      const resp = await patchZoneSetting(data, endpoint);
      return resp;
    }

    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/settings/automatic_platform_optimization"
      );
      const resp2 = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/settings/automatic_platform_optimization"
      );
      const valueResp = resp.map((zone) => {
        const newObj = { ...zone.resp };
        newObj.result.id = "enabled";
        return newObj;
      });
      const cacheByDeviceTypeResp = resp2.map((zone) => {
        const newObj = { ...zone.resp };
        newObj.result.id = "cache_by_device_type";
        return newObj;
      });
      const secondaryProcessedResp = [
        [...valueResp],
        [...cacheByDeviceTypeResp],
      ];
      setAutomaticPlatformOptimizationData(secondaryProcessedResp);
    }

    SuccessPromptOnClose();
    // not possible for data not to be loaded (logic is at displaying this button)
    const baseZoneData = data[0][0];
    const otherZoneKeys = zoneKeys.slice(1);

    const createData = {
      value: baseZoneData.result.value,
    };

    for (const key of otherZoneKeys) {
      const dataToCreate = _.cloneDeep(createData);
      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };
      setCurrentZone(key);
      const dataWithAuth = { ...authObj, data: dataToCreate };
      const { resp: postRequestResp } = await sendPostRequest(
        dataWithAuth,
        "/patch/settings/automatic_platform_optimization"
      );
      if (postRequestResp.success === false) {
        ErrorPromptOnOpen();
        return;
      }
    }
    SuccessPromptOnOpen();
    setAutomaticPlatformOptimizationData();
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
      const resp = await patchZoneSetting(data, endpoint);
      return resp;
    }

    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/settings/automatic_platform_optimization"
      );
      const resp2 = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/settings/automatic_platform_optimization"
      );
      const valueResp = resp.map((zone) => {
        const newObj = { ...zone.resp };
        newObj.result.id = "enabled";
        return newObj;
      });
      const cacheByDeviceTypeResp = resp2.map((zone) => {
        const newObj = { ...zone.resp };
        newObj.result.id = "cache_by_device_type";
        return newObj;
      });
      const secondaryProcessedResp = [
        [...valueResp],
        [...cacheByDeviceTypeResp],
      ];
      setAutomaticPlatformOptimizationData(secondaryProcessedResp);
    }

    // not possible for data not to be loaded (logic is at displaying this button)
    const baseZoneData = data[0][0];
    const otherZoneKeys = zoneKeys.slice(1);

    // initialize state
    setProgress((prevState) => {
      const newState = {
        ...prevState,
        [props.id]: {
          ...prevState[props.id],
          status: "copy",
          totalToCopy: 1,
          progressTotal: 0,
          completed: false,
        },
      };
      return newState;
    });

    const createData = {
      value: baseZoneData.result.value,
    };

    for (const key of otherZoneKeys) {
      const dataToCreate = _.cloneDeep(createData);
      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };
      // setCurrentZone(key);
      const dataWithAuth = { ...authObj, data: dataToCreate };
      const { resp: postRequestResp } = await sendPostRequest(
        dataWithAuth,
        "/patch/settings/automatic_platform_optimization"
      );
      if (postRequestResp.success === false) {
        const errorObj = {
          code: postRequestResp.errors[0].code,
          message: postRequestResp.errors[0].message,
          data: dataToCreate.value,
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
              copied: prevState[props.id]["copied"].concat(dataToCreate),
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
    setAutomaticPlatformOptimizationData();
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

  if (!automaticPlatformOptimizationData) {
  } // don't do anything while the app has not loaded
  else if (
    automaticPlatformOptimizationData &&
    automaticPlatformOptimizationData[0][0].success &&
    automaticPlatformOptimizationData[0][0].result
  ) {
    zoneCopierFunctions[props.id] = (setResults, setProgress) =>
      bulkCopyHandler(
        automaticPlatformOptimizationData,
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
            automaticPlatformOptimizationData &&
            automaticPlatformOptimizationData[0][0].success &&
            automaticPlatformOptimizationData[0][0].result
          }
          copy={() =>
            patchDataFromBaseToOthers(
              automaticPlatformOptimizationData,
              zoneKeys,
              credentials
            )
          }
        />
      }
      {ErrorPromptIsOpen && (
        <ErrorPromptModal
          isOpen={ErrorPromptIsOpen}
          onOpen={ErrorPromptOnOpen}
          onClose={ErrorPromptOnClose}
          title={`Error`}
          errorMessage={`An error has occurred, please close this window and try again.`}
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
      {!automaticPlatformOptimizationData && <LoadingBox />}
      {automaticPlatformOptimizationData && (
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

export default AutomaticPlatformOptimization;
