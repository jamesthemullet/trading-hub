/* istanbul ignore file */
import styled from '@emotion/styled';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect, useState } from 'react';

type Status = {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  components: {
    CommitDetails: {
      status: 'UP' | 'DOWN' | 'UNKNOWN';
      details: {
        APP_COMMIT_SHA: string;
      };
    };
    db: {
      status: 'UP' | 'DOWN' | 'UNKNOWN';
      details: {
        database: string;
        validationQuery: string;
      };
    };
    diskSpace: {
      status: 'UP' | 'DOWN' | 'UNKNOWN';
      details: {
        total: number;
        free: number;
        threshold: number;
        path: string;
        exists: boolean;
      };
    };
    elasticsearch: {
      status: 'UP' | 'DOWN' | 'UNKNOWN';
      details: {
        cluster_name: string;
        status: string;
        timed_out: boolean;
        number_of_nodes: number;
        number_of_data_nodes: number;
        active_primary_shards: number;
        active_shards: number;
        relocating_shards: number;
        initializing_shards: number;
        unassigned_shards: number;
        delayed_unassigned_shards: number;
        number_of_pending_tasks: number;
        number_of_in_flight_fetch: number;
        task_max_waiting_in_queue_millis: number;
        active_shards_percent_as_number: number;
      };
    };
    ping: {
      status: 'UP' | 'DOWN' | 'UNKNOWN';
    };
  };
};

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatusHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StatusLabel = styled.span`
  font-size: 1.5em;
  margin: 20px;
`;

const ComponentsStatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const Component = styled.div`
  min-height: 50px;
  min-width: 600px;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  box-shadow: 0 0 5px 0 gray;
`;

const ComponentHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ComponentBody = styled.div`
  padding-left: 20px;
  padding-top: 10px;
`;

const ComponentRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const ComponentKey = styled.span`
  font-size: 0.7em;
  font-weight: bold;
  margin-right: 5px;
`;
const ComponentValue = styled.span`
  font-size: 0.7em;
`;

const ComponentName = styled.span``;

const ComponentIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ status }: { status: string }) => {
    switch (status) {
      case 'UP':
        return 'green';
      case 'DOWN':
        return 'red';
      case 'UNKNOWN':
        return 'gray';
    }
  }};
`;

const DiskSpaceIndicatorContainer = styled.div`
  background-color: #f0f0f0;
  border-radius: 5px;
`;

const DiskSpaceIndicatorBar = styled.div<{
  total: number;
  free: number;
  threshold: number;
}>`
  height: 24px;
  border-radius: 5px;
  width: ${({
    total,
    free,
  }: {
    total: number;
    free: number;
    threshold: number;
  }) => `${(free / total) * 100}%`};
  background-color: ${({
    free,
    threshold,
  }: {
    free: number;
    threshold: number;
  }) => (free > threshold ? 'green' : 'red')};
`;

const DiskSpaceIndicatorLabel = styled.span`
  font-size: 0.7em;
  padding: 5px;
  color: white;
`;

const DiskSpaceIndicator = ({
  total,
  free,
  threshold,
  label,
}: {
  total: number;
  free: number;
  threshold: number;
  label: string;
}) => {
  return (
    <DiskSpaceIndicatorContainer>
      <DiskSpaceIndicatorBar total={total} free={free} threshold={threshold}>
        <DiskSpaceIndicatorLabel>{label}</DiskSpaceIndicatorLabel>
      </DiskSpaceIndicatorBar>
    </DiskSpaceIndicatorContainer>
  );
};

const toGigabytes = (bytes: number) => {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
};

const Index = ({ apiBaseUrl }: { apiBaseUrl: string | undefined }) => {
  const [status, setStatus] = useState<Status>({
    status: 'UNKNOWN',
    components: {
      CommitDetails: {
        status: 'UNKNOWN',
        details: {
          APP_COMMIT_SHA: '',
        },
      },
      db: {
        status: 'UNKNOWN',
        details: {
          database: '',
          validationQuery: '',
        },
      },
      diskSpace: {
        status: 'UNKNOWN',
        details: {
          total: 0,
          free: 0,
          threshold: 0,
          path: '',
          exists: false,
        },
      },
      elasticsearch: {
        status: 'UNKNOWN',
        details: {
          cluster_name: '',
          status: '',
          timed_out: false,
          number_of_nodes: 0,
          number_of_data_nodes: 0,
          active_primary_shards: 0,
          active_shards: 0,
          relocating_shards: 0,
          initializing_shards: 0,
          unassigned_shards: 0,
          delayed_unassigned_shards: 0,
          number_of_pending_tasks: 0,
          number_of_in_flight_fetch: 0,
          task_max_waiting_in_queue_millis: 0,
          active_shards_percent_as_number: 0,
        },
      },
      ping: {
        status: 'UNKNOWN',
      },
    },
  });

  const [details, setDetails] = useState<string>('');

  const session = useSession();

  useEffect(() => {
    const fetchStatus = async () => {
      if (!apiBaseUrl) {
        setDetails('No API base URL found');
        return;
      }
      const statusUrl = `${apiBaseUrl}/health`;
      const res = await fetch(statusUrl);
      if (res.status !== 200) {
        setDetails(`Status URL returned ${res.status}`);
        return;
      }
      const json = (await res.json()) as Status;
      setStatus(json);
    };
    const interval = setInterval(fetchStatus, 5000);
    void fetchStatus();
    return () => {
      clearInterval(interval);
    };
  }, [apiBaseUrl]);

  return (
    <>
      <Head>
        <title>{`Backend services status`}</title>
      </Head>
      {session && session.status === 'authenticated' && (
        <StatusContainer>
          <StatusHeader>
            <StatusLabel>Current Status:</StatusLabel>
            <ComponentIcon title={details} status={status.status} />
          </StatusHeader>
          <ComponentsStatusContainer>
            <Component>
              <ComponentHeader>
                <ComponentName>CommitDetails</ComponentName>
                <ComponentIcon
                  title={status.components.CommitDetails.status}
                  status={status.components.CommitDetails.status}
                />
              </ComponentHeader>
              <ComponentBody>
                <ComponentRow>
                  <ComponentKey>APP_COMMIT_SHA:</ComponentKey>
                  <ComponentValue>
                    "{status.components.CommitDetails.details.APP_COMMIT_SHA}"
                  </ComponentValue>
                </ComponentRow>
              </ComponentBody>
            </Component>
            <Component>
              <ComponentHeader>
                <ComponentName>db</ComponentName>
                <ComponentIcon
                  title={status.components.db.status}
                  status={status.components.db.status}
                />
              </ComponentHeader>
              <ComponentBody>
                <ComponentRow>
                  <ComponentKey>database:</ComponentKey>
                  <ComponentValue>
                    "{status.components.db.details.database}"
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>validationQuery:</ComponentKey>
                  <ComponentValue>
                    "{status.components.db.details.validationQuery}"
                  </ComponentValue>
                </ComponentRow>
              </ComponentBody>
            </Component>
            <Component>
              <ComponentHeader>
                <ComponentName>diskSpace</ComponentName>
                <ComponentIcon
                  title={status.components.diskSpace.status}
                  status={status.components.diskSpace.status}
                />
              </ComponentHeader>
              <ComponentBody>
                {status.components.diskSpace.details.exists ? (
                  <DiskSpaceIndicator
                    total={status.components.diskSpace.details.total}
                    free={status.components.diskSpace.details.free}
                    threshold={status.components.diskSpace.details.threshold}
                    label={`${status.components.diskSpace.details.path} (${toGigabytes(status.components.diskSpace.details.free)}/${toGigabytes(status.components.diskSpace.details.total)} GB)`}
                  />
                ) : (
                  <span>Disk doesn't exist</span>
                )}
              </ComponentBody>
            </Component>
            <Component>
              <ComponentHeader>
                <ComponentName>elasticsearch</ComponentName>
                <ComponentIcon
                  title={status.components.elasticsearch.status}
                  status={status.components.elasticsearch.status}
                />
              </ComponentHeader>
              <ComponentBody>
                <ComponentRow>
                  <ComponentKey>cluster_name:</ComponentKey>
                  <ComponentValue>
                    "{status.components.elasticsearch.details.cluster_name}"
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>status:</ComponentKey>
                  <ComponentValue>
                    "{status.components.elasticsearch.details.status}"
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>timed_out:</ComponentKey>
                  <ComponentValue>
                    {status.components.elasticsearch.details.timed_out.toString()}
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>number_of_nodes:</ComponentKey>
                  <ComponentValue>
                    {status.components.elasticsearch.details.number_of_nodes}
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>number_of_data_nodes:</ComponentKey>
                  <ComponentValue>
                    {
                      status.components.elasticsearch.details
                        .number_of_data_nodes
                    }
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>active_primary_shards:</ComponentKey>
                  <ComponentValue>
                    {
                      status.components.elasticsearch.details
                        .active_primary_shards
                    }
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>active_shards:</ComponentKey>
                  <ComponentValue>
                    {status.components.elasticsearch.details.active_shards}
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>relocating_shards:</ComponentKey>
                  <ComponentValue>
                    {status.components.elasticsearch.details.relocating_shards}
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>initializing_shards:</ComponentKey>
                  <ComponentValue>
                    {
                      status.components.elasticsearch.details
                        .initializing_shards
                    }
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>unassigned_shards:</ComponentKey>
                  <ComponentValue>
                    {status.components.elasticsearch.details.unassigned_shards}
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>delayed_unassigned_shards:</ComponentKey>
                  <ComponentValue>
                    {
                      status.components.elasticsearch.details
                        .delayed_unassigned_shards
                    }
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>number_of_pending_tasks:</ComponentKey>
                  <ComponentValue>
                    {
                      status.components.elasticsearch.details
                        .number_of_pending_tasks
                    }
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>number_of_in_flight_fetch:</ComponentKey>
                  <ComponentValue>
                    {
                      status.components.elasticsearch.details
                        .number_of_in_flight_fetch
                    }
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>task_max_waiting_in_queue_millis:</ComponentKey>
                  <ComponentValue>
                    {
                      status.components.elasticsearch.details
                        .task_max_waiting_in_queue_millis
                    }
                  </ComponentValue>
                </ComponentRow>
                <ComponentRow>
                  <ComponentKey>active_shards_percent_as_number:</ComponentKey>
                  <ComponentValue>
                    {
                      status.components.elasticsearch.details
                        .active_shards_percent_as_number
                    }
                  </ComponentValue>
                </ComponentRow>
              </ComponentBody>
            </Component>
          </ComponentsStatusContainer>
        </StatusContainer>
      )}
    </>
  );
};

export const getServerSideProps = () => {
  const baseURl = process.env.MERCHANDISING_API_BASEURL
    ? new URL(process.env.MERCHANDISING_API_BASEURL).origin
    : undefined;
  return {
    props: {
      apiBaseUrl: baseURl ?? null,
    },
  };
};

export default Index;
