#!/usr/bin/env bun

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(text1: string, text2: string): number {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  console.log('Text 1:', text1);
  console.log('Normalized 1:', normalized1);
  console.log('Text 2:', text2);
  console.log('Normalized 2:', normalized2);
  
  if (normalized1 === normalized2) return 1.0;
  if (!normalized1 || !normalized2) return 0.0;
  
  const words1 = new Set(normalized1.split(' '));
  const words2 = new Set(normalized2.split(' '));
  
  console.log('Words 1:', Array.from(words1));
  console.log('Words 2:', Array.from(words2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  console.log('Intersection:', Array.from(intersection));
  console.log('Union:', Array.from(union));
  console.log('Intersection size:', intersection.size);
  console.log('Union size:', union.size);
  
  const similarity = intersection.size / union.size;
  console.log('Similarity:', similarity);
  
  return similarity;
}

// Test the failing case
const text1 = "The user interface is intuitive and easy to navigate";
const text2 = "The user interface is intuitive and simple to navigate";

const similarity = calculateSimilarity(text1, text2);
console.log('\nFinal similarity:', similarity);
console.log('Above 0.8 threshold?', similarity >= 0.8);