export type PipelineNode = (object: any) => any;

declare global {
  const jest: any;
}

export const moebiusBuilder = () => {
  const initialStages: PipelineNode[] = [];
  const pipelineStages: PipelineNode[] = [];
  const runPipeline = () => [...initialStages, ...pipelineStages].reduce((object, node) => node(object), null as any);

  initialStages.push(() => () => runPipeline());
  pipelineStages.push(object => new Proxy(object, {
    get: (target, key) => (key in target ? target[key] : (target[key] = runPipeline())),
    set: (target, key, value) => (target[key] = value, true),
  }));

  return {
    pipeline: pipelineStages,
    build: runPipeline,
  };
};

export const defaultBuilder = moebiusBuilder();
defaultBuilder.pipeline.unshift(object => (typeof jest !== 'undefined' ? jest.fn(object) : object));
defaultBuilder.pipeline.push((object) => {
  object.toString = () => '[whatever Moebius]';
  object.valueOf = () => 42;
  object.then = undefined;
  object.calls = undefined;
  return object;
});

export default defaultBuilder.build;
