function* simpleYieldDemo(): Generator<string, string, void> {
  console.log('1. 进入 generator');
  yield '第一个 yield';

  console.log('2. 从第一个 yield 继续执行');
  yield '第二个 yield';

  console.log('3. generator 执行结束');
  return 'done';
}

export function runIteratorDemo(): void {
  const generator = simpleYieldDemo();

  console.log('第一次 next():', generator.next());
  console.log('第二次 next():', generator.next());
  console.log('第三次 next():', generator.next());
}
