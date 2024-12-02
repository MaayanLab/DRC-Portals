import React from 'react';
import { Typography, Link } from '@mui/material';
import { Prisma } from '@prisma/client';

type Publication = Prisma.PublicationGetPayload<{
}>;
interface CitationProps {
  publication: Publication;
  searchTerm?: string;
}

const PublicationCitation = ({ publication, searchTerm }: CitationProps) => {
  // add et al after 10th author
  const formatAuthors = (authorString: string) => {
    const authors = authorString.split(',');
    return authors.length <= 10 ? authorString : authors.slice(0, 10).join(',') + ' et al.,';
  };
  const toCamelCase = (str: String) => {
    return str.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  const highlightSearchTerm = (title: string, term: string) => {
    if (!term?.trim()) return <>{title}</>;
    const lowerTitle = title.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerTitle.indexOf(lowerTerm);
    if (index === -1) return <>{title}</>;
    return (
      <>
        {title.slice(0, index)}
        <span style={{ textDecoration: 'underline', fontSize: '1rem' }}>
          {title.slice(index, index + term.length)}
        </span>
        {title.slice(index + term.length)}
      </>
    );
  };

  return (
    <Typography
      color="secondary"
      variant="caption"
      sx={{ wordBreak: 'break-all', overflowWrap: 'break-word', display: 'inline-block', maxWidth: '100%' }}
    >
      {formatAuthors(publication.authors)}. {publication.year}.{' '}
      <b>
        {searchTerm ?
          highlightSearchTerm(publication.title, searchTerm) :
          publication.title
        }
        {!publication.title.endsWith(".") && "."}
      </b>{' '}
      {publication.journal && (
        <span style={{ fontStyle: 'italic' }}>{toCamelCase(publication.journal)}</span>
      )}. {publication.volume}
      {publication.issue && `(${publication.issue})`}
      {publication.page && `:${publication.page}`}.{' '}
      {publication.doi && (
        <Link
          target="_blank"
          rel="noopener noreferrer"
          color="secondary"
          href={`https://www.doi.org/${publication.doi}`}
        >
          https://www.doi.org/{publication.doi}
        </Link>
      )}
    </Typography>
  );
};

export default PublicationCitation;