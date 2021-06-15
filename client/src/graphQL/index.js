import { gql } from '@apollo/client';

export const ADD_MARKUP_TO_CANVAS = gql`
    mutation AddMarkupToCanvas( $markup: MarkupInput!) {
        addMarkupToCanvas(markup: $markup) {
            type
            user {
                name
                color
            }
            points {
                x
                y
            }
        }
    }
`;


export const ASSIGN_USER = gql`
    mutation AssignUser( $name: String!) {
        assignUser(name: $name) {
            name
            color
        }
    }
`;

export const ON_MARKUPS_ADDED = gql`
    subscription OnMarkupAdded {
        onMarkupAdded {
            points {
                x 
                y
            }
            type
            user {
                name
                color
            }
        }
    }
`;

export const ON_USER_ADDED = gql`
    subscription OnUserAdded {
        onUserJoined {
            color
            name
        }
    }
`;

export const GET_ALL_MARKUPS = gql`
    query GetAllMarkups {
        getMarkupsForCanvas {
            type
            user {
                name
                color
            }
            points {
                x
                y
            }
        }
    }
`;


export const UPLOAD_PNG_BLOB = gql`
    mutation UploadPngDataUrl($imgData: String!) {
        uploadImgDataUrl(imgData: $imgData) {
            success
        }
    }
`