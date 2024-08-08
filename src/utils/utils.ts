

export function removeParameters(input: string | null): string | null {
  if(!input){
    return input
  }
  return input.replace(/\([^\)]*\)/g, '');
}