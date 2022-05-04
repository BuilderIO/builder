export NODE_OPTIONS="--unhandled-rejections=strict"

all: dist/BuilderContent.json

@PHONY:
clean:
	rm dist/BuilderContent.json

dist/%.json: tsconfig.json src/index.ts
	npx typescript-json-schema tsconfig.json $(basename $(notdir $@)) > $@
