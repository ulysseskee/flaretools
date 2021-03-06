import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Stack,
  Table,
  Text,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
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
  // CountDeltaDifferences,
  createZoneSetting,
  deleteZoneSetting,
  getMultipleZoneSettings,
  getZoneSetting,
  HeaderFactory,
  Humanize,
  UnsuccessfulHeaders,
} from "../../../utils/utils";
import LoadingBox from "../../LoadingBox";
import NonEmptyErrorModal from "../commonComponents/NonEmptyErrorModal";
import ProgressBarModal from "../commonComponents/ProgressBarModal";
import RecordsErrorPromptModal from "../commonComponents/RecordsErrorPromptModal";
import SuccessPromptModal from "../commonComponents/SuccessPromptModal";

const conditionsToMatch = (base, toCompare) =>
  base.type === toCompare.type &&
  base.name === toCompare.name &&
  base.content === toCompare.content &&
  base.proxied === toCompare.proxied &&
  base.ttl === toCompare.ttl;

const DnsRecords = (props) => {
  const { zoneKeys, credentials, zoneDetails, zoneCopierFunctions } =
    useCompareContext();
  const [dnsRecords, setDnsRecords] = useState();
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
    isOpen: DeletionProgressBarIsOpen,
    onOpen: DeletionProgressBarOnOpen,
    onClose: DeletionProgressBarOnClose,
  } = useDisclosure(); // ProgressBarModal -- Deletion;
  const {
    isOpen: CopyingProgressBarIsOpen,
    onOpen: CopyingProgressBarOnOpen,
    onClose: CopyingProgressBarOnClose,
  } = useDisclosure(); // ProgressBarModal -- Copying;
  const [currentZone, setCurrentZone] = useState();
  const [numberOfRecordsToDelete, setNumberOfRecordsToDelete] = useState(0);
  const [numberOfRecordsDeleted, setNumberOfRecordsDeleted] = useState(0);
  const [numberOfRecordsToCopy, setNumberOfRecordsToCopy] = useState(0);
  const [numberOfRecordsCopied, setNumberOfRecordsCopied] = useState(0);
  const [errorPromptList, setErrorPromptList] = useState([]);

  useEffect(() => {
    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/dns_records"
      );
      const processedResp = resp.map((zone) => zone.resp);
      setDnsRecords(processedResp);
    }
    setDnsRecords();
    getData();
  }, [credentials, zoneKeys]);

  const columns = React.useMemo(() => {
    const baseHeaders = [
      {
        Header: "Type",
        accessor: "type",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Content",
        accessor: "content",
      },
      {
        Header: "Proxied",
        accessor: "proxied",
        Cell: (props) =>
          props.value ? <CheckIcon color="green" /> : <CloseIcon color="red" />,
      },
      {
        Header: "TTL",
        accessor: "ttl",
        Cell: (props) => (props.value === 1 ? <Text>Auto</Text> : props.value),
      },
    ];

    const dynamicHeaders =
      dnsRecords !== undefined ? HeaderFactory(dnsRecords.length) : [];

    return dnsRecords && dnsRecords[0].success && dnsRecords[0].result.length
      ? baseHeaders.concat(dynamicHeaders)
      : UnsuccessfulHeaders.concat(dynamicHeaders);
  }, [dnsRecords]);

  const data = React.useMemo(
    () =>
      dnsRecords
        ? CompareData(
            CompareBaseToOthers,
            dnsRecords,
            conditionsToMatch,
            "DNS Management"
          )
        : [],
    [dnsRecords]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  // const delta = React.useMemo(
  //   () => (dnsRecords ? CountDeltaDifferences(zoneKeys, data, dnsRecords) : []),
  //   [data, dnsRecords, zoneKeys]
  // );

  const handleDelete = async (data, zoneKeys, credentials) => {
    if (NonEmptyErrorIsOpen) {
      NonEmptyErrorOnClose();
    }

    const otherZoneKeys = zoneKeys.slice(1);

    setNumberOfRecordsDeleted(0);
    setNumberOfRecordsToDelete(0);

    for (let i = 1; i < data.length; i++) {
      if (data[i].success === true && data[i].result.length) {
        setNumberOfRecordsToDelete((prev) => prev + data[i].result.length);
      }
    }

    DeletionProgressBarOnOpen();

    for (const key of otherZoneKeys) {
      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };

      const { resp } = await getZoneSetting(authObj, "/dns_records");

      if (resp.success === false || resp.result.length === 0) {
        const errorObj = {
          code: resp.errors[0].code,
          message: resp.errors[0].message,
          data: "",
        };
        setErrorPromptList((prev) => [...prev, errorObj]);
        ErrorPromptOnOpen();
        return;
      } else {
        for (const record of resp.result) {
          const createData = _.cloneDeep(authObj);
          createData["identifier"] = record.id; // need to send identifier to API endpoint
          const { resp } = await deleteZoneSetting(
            createData,
            "/delete/dns_records"
          );
          if (resp.success === false) {
            const errorObj = {
              code: resp.errors[0].code,
              message: resp.errors[0].message,
              data: createData.identifier,
            };
            setErrorPromptList((prev) => [...prev, errorObj]);
            ErrorPromptOnOpen();
            return;
          }
          setNumberOfRecordsDeleted((prev) => prev + 1);
        }
      }
    }
    DeletionProgressBarOnClose();
    copyDataFromBaseToOthers(data, zoneKeys, credentials);
  };

  const copyDataFromBaseToOthers = async (data, zoneKeys, credentials) => {
    async function sendPostRequest(data, endpoint) {
      const resp = await createZoneSetting(data, endpoint);
      return resp;
    }

    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/dns_records"
      );
      const processedResp = resp.map((zone) => zone.resp);
      setDnsRecords(processedResp);
    }

    let errorCount = 0;
    setErrorPromptList([]);

    SuccessPromptOnClose();
    // not possible for data not to be loaded (logic is at displaying this button)
    const baseZoneData = data[0];
    const otherZoneKeys = zoneKeys.slice(1);

    // check if other zone has any data prior to create records
    // we want to start the other zone from a clean slate
    for (const key of otherZoneKeys) {
      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };
      const { resp: checkIfEmpty } = await getZoneSetting(
        authObj,
        "/dns_records"
      );

      if (checkIfEmpty.success === true && checkIfEmpty.result.length !== 0) {
        setCurrentZone(key);
        NonEmptyErrorOnOpen();
        return;
      }
    }

    setNumberOfRecordsCopied(0);
    setNumberOfRecordsToCopy(data[0].result.length * data.slice(1).length);

    for (const record of baseZoneData.result) {
      const exp = new RegExp("(.*)?." + zoneDetails.zone_1.name);
      const createData = {
        type: record.type,
        name: record.name.match(exp) ? record.name.match(exp)[1] : null,
        content: record.content,
        ttl: record.ttl,
      };
      if (record?.priority !== undefined) {
        createData["priority"] = record.priority;
      }
      if (record?.proxied !== undefined) {
        createData["proxied"] = record.proxied;
      }
      for (const key of otherZoneKeys) {
        const dataToCreate = _.cloneDeep(createData);
        const authObj = {
          zoneId: credentials[key].zoneId,
          apiToken: `Bearer ${credentials[key].apiToken}`,
        };
        setCurrentZone(key);
        if (CopyingProgressBarIsOpen) {
        } else {
          CopyingProgressBarOnOpen();
        }
        if (dataToCreate.name === null) {
          const { zone_details: otherZoneDetails } = await getZoneSetting(
            authObj,
            "/zone_details"
          );
          if (otherZoneDetails.success) {
            dataToCreate.name = otherZoneDetails.result.name;
          } else {
            return alert(
              `Error: Authentication details for ${zoneDetails[key].name} was incorrect`
            );
          }
        }
        const dataWithAuth = { ...authObj, data: dataToCreate };
        const { resp: postRequestResp } = await sendPostRequest(
          dataWithAuth,
          "/copy/dns_records"
        );
        if (postRequestResp.success === false) {
          const errorObj = {
            code: postRequestResp.errors[0].code,
            message: postRequestResp.errors[0].message,
            data: dataToCreate.name,
          };
          errorCount += 1;
          setErrorPromptList((prev) => [...prev, errorObj]);
        }
        setNumberOfRecordsCopied((prev) => prev + 1);
      }
    }
    CopyingProgressBarOnClose();

    // if there is some error at the end of copying, show the records that
    // were not copied
    if (errorCount > 0) {
      ErrorPromptOnOpen();
    } else {
      SuccessPromptOnOpen();
    }
    setDnsRecords();
    getData();
  };

  const bulkDeleteHandler = async (
    data,
    zoneKeys,
    credentials,
    setResults,
    setProgress
  ) => {
    const otherZoneKeys = zoneKeys.slice(1);
    let bulkErrorCount = 0;

    // reset state for the setting
    setProgress((prevState) => {
      const newState = {
        ...prevState,
        [props.id]: {
          ...prevState[props.id],
          status: "delete",
          totalToCopy: 0,
          progressTotal: 0,
          completed: false,
        },
      };
      return newState;
    });

    for (let i = 1; i < data.length; i++) {
      if (data[i].success === true && data[i].result.length) {
        setProgress((prevState) => {
          const newState = {
            ...prevState,
            [props.id]: {
              ...prevState[props.id],
              totalToCopy:
                prevState[props.id]["totalToCopy"] + data[i].result.length,
            },
          };
          return newState;
        });
      }
    }

    for (const key of otherZoneKeys) {
      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };

      const { resp } = await getZoneSetting(authObj, "/dns_records");

      if (resp.success === false || resp.result.length === 0) {
        const errorObj = {
          code: resp.errors[0].code,
          message: resp.errors[0].message,
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
        bulkErrorCount += 1;
      } else {
        for (const record of resp.result) {
          const createData = _.cloneDeep(authObj);
          createData["identifier"] = record.id; // need to send identifier to API endpoint
          const { resp } = await deleteZoneSetting(
            createData,
            "/delete/dns_records"
          );
          if (resp.success === false) {
            const errorObj = {
              code: resp.errors[0].code,
              message: resp.errors[0].message,
              data: createData.identifier,
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
            bulkErrorCount += 1;
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
      }
    }
    if (bulkErrorCount > 0) {
      return;
    } else {
      bulkCopyHandler(data, zoneKeys, credentials, setResults, setProgress);
    }
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
      const resp = await createZoneSetting(data, endpoint);
      return resp;
    }

    async function getData() {
      const resp = await getMultipleZoneSettings(
        zoneKeys,
        credentials,
        "/dns_records"
      );
      const processedResp = resp.map((zone) => zone.resp);
      setDnsRecords(processedResp);
    }

    // not possible for data not to be loaded (logic is at displaying this button)
    const baseZoneData = data[0];
    const otherZoneKeys = zoneKeys.slice(1);

    // check if other zone has any data prior to create records
    // we want to start the other zone from a clean slate
    for (const key of otherZoneKeys) {
      const authObj = {
        zoneId: credentials[key].zoneId,
        apiToken: `Bearer ${credentials[key].apiToken}`,
      };
      const { resp: checkIfEmpty } = await getZoneSetting(
        authObj,
        "/dns_records"
      );

      if (checkIfEmpty.success === true && checkIfEmpty.result.length !== 0) {
        return bulkDeleteHandler(
          data,
          zoneKeys,
          credentials,
          setResults,
          setProgress
        );
      }
    }

    // initialize state
    setProgress((prevState) => {
      const newState = {
        ...prevState,
        [props.id]: {
          ...prevState[props.id],
          status: "copy",
          totalToCopy: data[0].result.length * data.slice(1).length,
          progressTotal: 0,
          completed: false,
        },
      };
      return newState;
    });

    for (const record of baseZoneData.result) {
      const exp = new RegExp("(.*)?." + zoneDetails.zone_1.name);
      const createData = {
        type: record.type,
        name: record.name.match(exp) ? record.name.match(exp)[1] : null,
        content: record.content,
        ttl: record.ttl,
      };
      if (record?.priority !== undefined) {
        createData["priority"] = record.priority;
      }
      if (record?.proxied !== undefined) {
        createData["proxied"] = record.proxied;
      }
      for (const key of otherZoneKeys) {
        const dataToCreate = _.cloneDeep(createData);
        const authObj = {
          zoneId: credentials[key].zoneId,
          apiToken: `Bearer ${credentials[key].apiToken}`,
        };
        // setCurrentZone(key);
        // if (CopyingProgressBarIsOpen) {
        // } else {
        //   CopyingProgressBarOnOpen();
        // }
        if (dataToCreate.name === null) {
          dataToCreate.name = zoneDetails[key].name;
        }
        const dataWithAuth = { ...authObj, data: dataToCreate };
        const { resp: postRequestResp } = await sendPostRequest(
          dataWithAuth,
          "/copy/dns_records"
        );
        if (postRequestResp.success === false) {
          const errorObj = {
            code: postRequestResp.errors[0].code,
            message: postRequestResp.errors[0].message,
            data: dataToCreate.name,
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
    }

    // return errors and successfully copied records
    setDnsRecords();
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

  if (!dnsRecords) {
  } // don't do anything while the app has not loaded
  else if (dnsRecords && dnsRecords[0].success && dnsRecords[0].result.length) {
    zoneCopierFunctions[props.id] = (setResults, setProgress) =>
      bulkCopyHandler(
        dnsRecords,
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
            dnsRecords && dnsRecords[0].success && dnsRecords[0].result.length
          }
          copy={() =>
            copyDataFromBaseToOthers(dnsRecords, zoneKeys, credentials)
          }
        />
      }
      {NonEmptyErrorIsOpen && (
        <NonEmptyErrorModal
          isOpen={NonEmptyErrorIsOpen}
          onOpen={NonEmptyErrorOnOpen}
          onClose={NonEmptyErrorOnClose}
          handleDelete={() => handleDelete(dnsRecords, zoneKeys, credentials)}
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
      {DeletionProgressBarIsOpen && (
        <ProgressBarModal
          isOpen={DeletionProgressBarIsOpen}
          onOpen={DeletionProgressBarOnOpen}
          onClose={DeletionProgressBarOnClose}
          title={`${Humanize(props.id)} records from ${
            zoneDetails[currentZone].name
          } are being deleted`}
          progress={numberOfRecordsDeleted}
          total={numberOfRecordsToDelete}
        />
      )}
      {CopyingProgressBarIsOpen && (
        <ProgressBarModal
          isOpen={CopyingProgressBarIsOpen}
          onOpen={CopyingProgressBarOnOpen}
          onClose={CopyingProgressBarOnClose}
          title={`${Humanize(props.id)} records are being copied from ${
            zoneDetails.zone_1.name
          } to ${zoneDetails[currentZone].name}`}
          progress={numberOfRecordsCopied}
          total={numberOfRecordsToCopy}
        />
      )}
      {!dnsRecords && <LoadingBox />}
      {dnsRecords && (
        <Table style={{ tableLayout: "fixed" }} {...getTableProps}>
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

export default DnsRecords;
