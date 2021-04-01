import { useEffect } from 'react';

const addUtterancesScript = (
  parentElement,
  repo,
  label,
  issueTerm,
  theme,
  isIssueNumber
): void => {
  const script = document.createElement('script');
  script.setAttribute('src', 'https://utteranc.es/client.js');
  script.setAttribute('crossorigin', 'anonymous');
  script.setAttribute('async', 'true');
  script.setAttribute('repo', repo);

  if (label !== '') {
    script.setAttribute('label', label);
  }

  if (isIssueNumber) {
    script.setAttribute('issue-number', issueTerm);
  } else {
    script.setAttribute('issue-term', issueTerm);
  }

  script.setAttribute('theme', theme);

  parentElement.appendChild(script);
};

const Comments = (): JSX.Element => {
  const repo = 'demotional/03-projeto-do-zero';
  const theme = 'github-dark';
  const issueTerm = 'pathname';
  const label = 'Comments';

  useEffect(() => {
    // Get comments box
    const commentsBox = document.getElementById('commentsBox');

    // Check if comments box is loaded
    if (!commentsBox) {
      return;
    }

    // Get utterances
    const utterances = document.getElementsByClassName('utterances')[0];

    // Remove utterances if it exists
    if (utterances) {
      utterances.remove();
    }

    // Add utterances script
    addUtterancesScript(commentsBox, repo, label, issueTerm, theme, false);
  });

  return <div id="commentsBox" />;
};

export default Comments;
