import { Box, Flex } from '@mantine/core';

import { spacing } from '../utils/spacing';

export const AccessDeny = ({ requiredRole }: { requiredRole: string }) => {
  return (
    <Flex
      justify="center"
      align="center"
      h="100%"
      mt={spacing(10)}
      direction="column"
    >
      <Box w={spacing(50)} h={spacing(40)} ta="center">
        You don&apos;t have access to this Page, please contact admin on our
        teams channel{' '}
        <a href="https://teams.microsoft.com/l/channel/19%3A69011a4ab2784a5b8c74bc7ad61472d7%40thread.tacv2/%5BSquad%5D%20Search%20-%20General?groupId=09be67e3-2208-45f2-9eaf-41d6c22743bb&tenantId=bd5c6713-7399-4b31-be79-78f2d078e543">
          here
        </a>{' '}
        to acquire &quot;{requiredRole}&quot; access role in order to see this
        resource.
      </Box>
    </Flex>
  );
};
