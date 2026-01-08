## Architecture of facet values page

The facet values page is built using a combination of React components, hooks, and reducers to manage state and handle user interactions. The main components involved in this page include:

- **GlobalEditableLabel**: This component allows users to edit the labels of facet values. It handles user input and dispatches actions to update the state accordingly.
  **NOTE:** due to BE constrains renaming is possible only by creating a new merge group with the new name, so even if we rename a single value it creates a merge group with one value inside.
- **useGlobalFacetAttributesList**: This custom hook fetches and manages the list of facet attributes. It interacts with the global state and provides the necessary data to the components.
- **GlobalAttributesPageReducer**: This reducer manages the state of the global attributes page, handling actions such as creating merge groups and updating facet values.
