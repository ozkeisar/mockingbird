const toBreadcrumb = function (path: string[]): string {
  return path.join('.');
};

export { toBreadcrumb };
