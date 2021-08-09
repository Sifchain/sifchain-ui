# Official cosmos guide on generating ts-proto's: https://github.com/cosmos/cosmjs/blob/79396bfaa49831127ccbbbfdbb1185df14230c63/packages/stargate/CUSTOM_PROTOBUF_CODECS.md
# Sifnode script used to generate protos: https://github.com/Sifchain/sifnode/blob/feature/ibc/scripts/protocgen.sh

SIFNODE_PROTO_DIR="./proto"
ls $SIFNODE_PROTO_DIR
mkdir -p $SIFNODE_PROTO_DIR
proto_dirs=$(find $SIFNODE_PROTO_DIR/proto -path -prune -o -name '*.proto' -print0 | xargs -0 -n1 dirname | sort | uniq)
for dir in $proto_dirs; do
  protoc \
    -I=$SIFNODE_PROTO_DIR/proto \
    -I=$SIFNODE_PROTO_DIR/third_party/proto gogoproto/gogo.proto \
    # --plugin=../node_modules/.bin/protoc-gen-ts_proto \
    --python_out=$PWD \
    # --ts_proto_out="../src/generated/proto" \
    --proto_path="$SIFNODE_PROTO_DIR" \
    # --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=true" \
  $(find "${dir}" -maxdepth 1 -name '*.proto')
done

