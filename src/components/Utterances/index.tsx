export function Utterances(): void {
  const script = document.createElement('script');
  const anchor = document.getElementById('comments');
  script.setAttribute('src', 'https://utteranc.es/client.js');
  script.setAttribute(
    'repo',
    'aleilson/ignite-projeto-blog-figma-spacetravelling'
  );
  script.setAttribute('issue-term', 'pathname');
  script.setAttribute('label', '[Comments]');
  script.setAttribute('theme', 'photon-dark');
  script.setAttribute('crossorigin', 'anonymous');
  script.setAttribute('async', 'true');
  anchor.appendChild(script);
}
