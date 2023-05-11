# doing this for each SDK is getting tedious, and I'm lazy.
echo "looping cmd \"$1\" over args \"$2\""

# run these loop commands in parallel
for i in $2; do
  echo "running $1 on $i"
  yarn run $1 $i loop
  # use this line to run these loop commands in parallel
  # yarn run $1 $i &
done

# wait for all the parallel commands to finish
# wait
