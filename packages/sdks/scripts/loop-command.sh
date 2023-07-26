set -eo nounset

# doing this for each SDK is getting tedious, and I'm lazy.
echo "looping cmd \"$1\" over all SDKs."

VERSION=${2:-'patch'}

# run these loop commands in parallel
for i in nextjs svelte react-native solid qwik react vue; do
  yarn run $1 $i $VERSION loop
  # use this line to run these loop commands in parallel
  # TO-DO: breaks on publish due to npm OTP prompts
  # yarn run $1 $i &
done

# wait for all the parallel commands to finish
# wait
